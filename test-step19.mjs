import { supabase } from './src/lib/supabaseClient.js';
import { quizService } from './src/lib/quizService.js';

async function runStep19() {
  console.log('=====================================================');
  console.log('>>> [STEP 19] Create First Real Chapter: Form 4 Sejarah Bab 1 <<<');
  console.log('=====================================================');

  // Step 1: Login as Admin
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@playbank.com',
    password: 'AdminPassword123!'
  });

  if (authErr) {
    console.error('❌ Admin Auth Failed:', authErr.message);
    process.exit(1);
  }
  console.log('✅ Admin Authenticated:', auth.user.email);

  // Step 2: Check if Bab 1 already exists under form-4-sej
  const { data: existing, error: checkErr } = await supabase
    .from('chapters')
    .select('*')
    .eq('grade_subject_id', 'form-4-sej')
    .eq('bab_number', 'Bab 1');

  if (checkErr) {
    console.error('❌ Error checking chapters:', checkErr.message);
    process.exit(1);
  }

  let chapterId = null;

  if (existing && existing.length > 0) {
    console.log('ℹ️ Chapter already exists:', existing[0].id);
    chapterId = existing[0].id;
    // Update it to make sure it matches Step 19 specs
    const { data: updated, error: updateErr } = await supabase
      .from('chapters')
      .update({
        title: 'Warisan Negara Bangsa',
        status: 'draft',
        random_questions: true,
        display_order: 1,
        has_unpublished_changes: true
      })
      .eq('id', chapterId)
      .select()
      .single();

    if (updateErr) {
      console.error('❌ Update failed:', updateErr.message);
      process.exit(1);
    }
    console.log('✅ Updated existing chapter to Step 19 specifications:', updated);
  } else {
    // Insert new chapter
    const newChapterPayload = {
      grade_id: 'form-4',
      subject_id: 'sejarah',
      grade_subject_id: 'form-4-sej',
      bab_number: 'Bab 1',
      title: 'Warisan Negara Bangsa',
      display_order: 1,
      status: 'draft',
      random_questions: true,
      published_random_questions: false,
      has_unpublished_changes: true,
      current_version_no: 0
    };

    const { data: inserted, error: insertErr } = await supabase
      .from('chapters')
      .insert(newChapterPayload)
      .select()
      .single();

    if (insertErr) {
      console.error('❌ Insert failed:', insertErr.message);
      process.exit(1);
    }
    chapterId = inserted.id;
    console.log('✅ Successfully inserted Chapter in Draft status:', inserted);
  }

  // Step 3: Verify isolation in player view (published_chapters)
  console.log('\n--- Verifying Player Isolation (published_chapters) ---');
  // Sign out admin to simulate player anonymous / public client
  await supabase.auth.signOut();

  const publishedList = await quizService.getPublishedChapters('form-4', 'sejarah');
  console.log('Player querying published chapters for form-4 sejarah: count =', publishedList.length);
  
  const leaked = publishedList.find(c => c.id === chapterId);
  if (leaked) {
    console.error('❌ SECURITY VIOLATION: Draft chapter appeared in published_chapters!', leaked);
    process.exit(1);
  } else {
    console.log('✅ Isolation Verified: Draft chapter is NOT visible to player client (0 published chapters found).');
  }

  // Step 4: Re-verify chapter metadata in Admin context
  console.log('\n--- Verifying Admin Chapter Details ---');
  await supabase.auth.signInWithPassword({
    email: 'admin@playbank.com',
    password: 'AdminPassword123!'
  });

  const { data: adminChapter, error: fetchErr } = await supabase
    .from('chapters')
    .select('*')
    .eq('id', chapterId)
    .single();

  if (fetchErr) {
    console.error('❌ Admin fetch failed:', fetchErr.message);
    process.exit(1);
  }

  console.log('📋 Chapter Details in DB:');
  console.log({
    id: adminChapter.id,
    grade_id: adminChapter.grade_id,
    subject_id: adminChapter.subject_id,
    grade_subject_id: adminChapter.grade_subject_id,
    bab_number: adminChapter.bab_number,
    title: adminChapter.title,
    status: adminChapter.status,
    random_questions: adminChapter.random_questions,
    current_version_no: adminChapter.current_version_no,
    has_unpublished_changes: adminChapter.has_unpublished_changes,
    display_order: adminChapter.display_order
  });

  const isSpecValid = (
    adminChapter.grade_id === 'form-4' &&
    adminChapter.subject_id === 'sejarah' &&
    adminChapter.grade_subject_id === 'form-4-sej' &&
    adminChapter.bab_number === 'Bab 1' &&
    adminChapter.title === 'Warisan Negara Bangsa' &&
    adminChapter.status === 'draft' &&
    adminChapter.random_questions === true &&
    adminChapter.current_version_no === 0 &&
    adminChapter.has_unpublished_changes === true
  );

  if (!isSpecValid) {
    console.error('❌ Chapter specification validation failed!');
    process.exit(1);
  }

  console.log('\n🎉 [STEP 19 COMPLETED SUCCESSFULLY] First real chapter created in Draft with Random ON, player isolation confirmed.');
}

runStep19().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
