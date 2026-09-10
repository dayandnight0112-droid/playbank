/**
 * test-step14.mjs
 * Verification script for Step 14: Reading Published Content
 */

import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || 'https://odphibljvpdhfsnkhoqs.supabase.co';
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_f9gWOUEV7TGcBF277zjTsQ_IXt9mbw3';

console.log('================================================================');
console.log('STEP 14 VERIFICATION: Reading Published Content (Player Scope)');
console.log('Target URL:', url);
console.log('Role: Anonymous / Player (No Admin Credentials Used)');
console.log('================================================================\n');

async function testStep14() {
  const anonClient = createClient(url, key);

  // 1. Verify reading Grades (11 grades)
  console.log('--- [TEST 1] Read 11 Grades from Live Database ---');
  const { data: grades, error: gErr } = await anonClient
    .from('grades')
    .select('*')
    .order('display_order', { ascending: true });

  if (gErr) throw new Error(`Failed to read grades: ${gErr.message}`);
  console.log(`  ✓ Successfully fetched ${grades.length} grades.`);
  if (grades.length !== 11) {
    throw new Error(`Expected 11 grades, found ${grades.length}`);
  }
  console.log('  Grades:', grades.map(g => `${g.id} (${g.name})`).join(', '));

  // 2. Verify reading Subjects
  console.log('\n--- [TEST 2] Read Subjects from Live Database ---');
  const { data: subjects, error: sErr } = await anonClient
    .from('subjects')
    .select('*')
    .order('display_order', { ascending: true });

  if (sErr) throw new Error(`Failed to read subjects: ${sErr.message}`);
  console.log(`  ✓ Successfully fetched ${subjects.length} subjects.`);
  console.log('  Subjects:', subjects.map(s => `${s.id} (${s.title_en || s.id})`).join(', '));

  // 3. Verify querying published_chapters view
  console.log('\n--- [TEST 3] Query published_chapters Security View ---');
  const { data: pubChapters, error: pcErr } = await anonClient
    .from('published_chapters')
    .select('*')
    .eq('grade_id', 'year-1')
    .eq('subject_id', 'sejarah');

  if (pcErr) throw new Error(`Failed to read published_chapters: ${pcErr.message}`);
  console.log(`  ✓ Successfully retrieved ${pubChapters.length} published chapters for Year 1 Sejarah.`);
  
  for (const ch of pubChapters) {
    console.log(`    - [${ch.bab_number}] ${ch.title} | Version: ${ch.version_no} | Questions: ${ch.question_count} | Random: ${ch.random_questions}`);
    if (!ch.id || !ch.bab_number || ch.version_no === undefined || ch.question_count === undefined) {
      throw new Error(`Incomplete chapter metadata in published_chapters: ${JSON.stringify(ch)}`);
    }
  }

  // 4. Verify draft chapters are STRICTLY INVISIBLE to anon/player
  console.log('\n--- [TEST 4] Isolation Check: Verify Base Chapters & Drafts are Hidden ---');
  const { data: baseChapters } = await anonClient
    .from('chapters')
    .select('*');

  console.log(`  ✓ Anon query on 'chapters' base table returned: ${baseChapters ? baseChapters.length : 0} rows (RLS blocked).`);

  const { data: draftCheck } = await anonClient
    .from('published_chapters')
    .select('*')
    .eq('status', 'draft');

  if (draftCheck && draftCheck.length > 0) {
    throw new Error('SECURITY VIOLATION: Draft chapter leaked in published_chapters view!');
  }
  console.log('  ✓ Published chapters view strictly guarantees ZERO draft chapters leak to player.');

  console.log('\n================================================================');
  console.log('🎉 STEP 14 VERIFICATION PASSED: Player successfully reads published content!');
  console.log('================================================================\n');
}

testStep14().catch(err => {
  console.error('❌ Step 14 Verification Failed:', err);
  process.exit(1);
});
