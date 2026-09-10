import { supabase } from './src/lib/supabaseClient.js';
import fs from 'fs';
import * as XLSX from '../playbank-admin/node_modules/xlsx/xlsx.mjs';

async function importAndPublish() {
  console.log('--- Step 20: Importing 40 Sejarah Form 4 Questions ---');

  // Authenticate as Admin
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@playbank.com',
    password: 'AdminPassword123!'
  });

  if (authErr) {
    console.error('Auth error:', authErr);
    process.exit(1);
  }
  console.log('✅ Authenticated as Admin:', auth.user.email);

  // Get Form 4 Sejarah Bab 1 chapter ID
  const { data: chapter, error: chErr } = await supabase
    .from('chapters')
    .select('*')
    .eq('grade_subject_id', 'form-4-sej')
    .eq('bab_number', 'Bab 1')
    .single();

  if (chErr || !chapter) {
    console.error('Chapter not found:', chErr);
    process.exit(1);
  }
  console.log('✅ Found Chapter:', chapter.id, chapter.bab_number, chapter.title);

  // Read both files
  const file1 = 'C:/Users/User/Downloads/PlayBank_20_Soalan_Sejarah_Form_4.xlsx';
  const file2 = 'C:/Users/User/Downloads/PlayBank_20_Soalan_Sejarah_Form_4_Set_2.xlsx';

  const wb1 = XLSX.read(fs.readFileSync(file1), { type: 'buffer' });
  const rows1 = XLSX.utils.sheet_to_json(wb1.Sheets[wb1.SheetNames[0]], { defval: '' });

  const wb2 = XLSX.read(fs.readFileSync(file2), { type: 'buffer' });
  const rows2 = XLSX.utils.sheet_to_json(wb2.Sheets[wb2.SheetNames[0]], { defval: '' });

  const allRows = rows1.concat(rows2);
  console.log(`✅ Loaded ${allRows.length} total questions from Excel files`);

  // Clear any existing draft questions for this chapter if needed
  await supabase.from('questions').delete().eq('chapter_id', chapter.id);

  // Prepare insert payloads
  const payloads = allRows.map((r, idx) => {
    const qNo = idx + 1;
    const optTimestamp = `${Date.now()}_${idx}`;
    const options = [
      { id: `opt_${optTimestamp}_1`, text: String(r.option_a).trim() },
      { id: `opt_${optTimestamp}_2`, text: String(r.option_b).trim() },
      { id: `opt_${optTimestamp}_3`, text: String(r.option_c).trim() },
      { id: `opt_${optTimestamp}_4`, text: String(r.option_d).trim() },
    ];
    const letterMap = { A: 0, B: 1, C: 2, D: 3 };
    const correctLetter = String(r.correct_answer || 'A').trim().toUpperCase();
    const correctIndex = letterMap[correctLetter] ?? 0;
    const correctOptionId = options[correctIndex].id;

    return {
      chapter_id: chapter.id,
      question_no: qNo,
      question: String(r.question).trim(),
      options,
      correct_option_id: correctOptionId,
      explanation: String(r.explanation || '').trim(),
      difficulty: String(r.difficulty || 'Medium').trim(),
      status: 'draft',
      is_archived: false,
      is_pending_delete: false,
      has_unpublished_edits: false
    };
  });

  // Batch insert into questions table
  const { data: inserted, error: insErr } = await supabase
    .from('questions')
    .insert(payloads)
    .select();

  if (insErr) {
    console.error('❌ Insert questions failed:', insErr);
    process.exit(1);
  }
  console.log(`✅ Inserted ${inserted.length} questions into questions table`);

  // Update chapter draft status
  await supabase.from('chapters').update({
    has_unpublished_changes: true,
    random_questions: true
  }).eq('id', chapter.id);

  // Publish chapter via RPC
  console.log('--- Calling publish_chapter RPC ---');
  const { data: pubRes, error: pubErr } = await supabase.rpc('publish_chapter', {
    p_chapter_id: chapter.id
  });

  if (pubErr) {
    console.error('❌ Publish RPC failed:', pubErr);
    process.exit(1);
  }
  console.log('✅ Publish RPC Success:', pubRes);

  // Verify published_chapters view
  const { data: pubView, error: viewErr } = await supabase
    .from('published_chapters')
    .select('*')
    .eq('id', chapter.id);

  console.log('✅ Published Chapters View Result:', pubView);
}

importAndPublish().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
