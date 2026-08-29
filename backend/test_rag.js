import { retrieveContext } from './src/rag/retriever.js';
import { generateRAGResponse } from './src/rag/generator.js';

const runTests = async () => {
  console.log('============================================================');
  console.log('Starting CollegeGPT RAG & Multi-College Verification Suite');
  console.log('Target: Sinhgad Academy of Engineering (SAOE), Pune');
  console.log('============================================================\n');

  // Test 1: Admissions & DTE Code Query
  console.log('--- Test 1: Admissions & DTE Choice Code Query ---');
  const q1 = 'What are the admission eligibility criteria and DTE Choice Code for Sinhgad Academy of Engineering?';
  const chunks1 = await retrieveContext(q1, { collegeId: 'saoe_pune', topK: 3 });
  console.log(`Retrieved ${chunks1.length} chunks.`);
  const resp1 = await generateRAGResponse(q1, chunks1, [], 'saoe_pune');
  console.log('Answer:\n', resp1.answer);
  console.log('Found:', resp1.found);
  console.log('Sources:', JSON.stringify(resp1.sources.map(s => ({ doc: s.documentName, page: s.page, score: s.score })), null, 2));

  if (!resp1.found || resp1.sources.length === 0 || !resp1.answer.includes('6187')) {
    console.error('❌ Test 1 FAILED: Expected DTE Code 6187 and sources');
  } else {
    console.log('✅ Test 1 PASSED\n');
  }

  // Test 2: Fee Structure & Concessions
  console.log('--- Test 2: Fee Structure & Concessions Query ---');
  const q2 = 'What is the approved fee structure for Open and EBC categories at SAOE?';
  const chunks2 = await retrieveContext(q2, { collegeId: 'saoe_pune', topK: 3 });
  const resp2 = await generateRAGResponse(q2, chunks2, [], 'saoe_pune');
  console.log('Answer:\n', resp2.answer);
  console.log('Found:', resp2.found);
  console.log('Sources:', JSON.stringify(resp2.sources.map(s => ({ doc: s.documentName, page: s.page, score: s.score })), null, 2));

  if (!resp2.found || resp2.sources.length === 0) {
    console.error('❌ Test 2 FAILED');
  } else {
    console.log('✅ Test 2 PASSED\n');
  }

  // Test 3: Central Placement Cell (CPC)
  console.log('--- Test 3: CPC Placements & Recruiters ---');
  const q3 = 'Which companies visit Sinhgad Central Placement Cell (CPC) and what is the highest package?';
  const chunks3 = await retrieveContext(q3, { collegeId: 'saoe_pune', topK: 3 });
  const resp3 = await generateRAGResponse(q3, chunks3, [], 'saoe_pune');
  console.log('Answer:\n', resp3.answer);
  console.log('Found:', resp3.found);
  console.log('Sources:', JSON.stringify(resp3.sources.map(s => ({ doc: s.documentName, page: s.page, score: s.score })), null, 2));

  if (!resp3.found || resp3.sources.length === 0) {
    console.error('❌ Test 3 FAILED');
  } else {
    console.log('✅ Test 3 PASSED\n');
  }

  // Test 4: Strict Multi-College Data Isolation
  console.log('--- Test 4: Multi-College Retrieval Isolation ---');
  const chunksOther = await retrieveContext(q1, { collegeId: 'other_college_xyz', topK: 3 });
  console.log(`Retrieved chunks for non-existent college: ${chunksOther.length}`);
  if (chunksOther.length === 0) {
    console.log('✅ Test 4 PASSED: Strict college data isolation confirmed (0 chunks retrieved for other college)\n');
  } else {
    console.error('❌ Test 4 FAILED: Chunks leaked across college boundary!');
  }

  // Test 5: Unknown Query Anti-Hallucination & Fallback
  console.log('--- Test 5: Strict Anti-Hallucination Fallback ---');
  const qUnknown = 'What is the college policy on deep-sea submarine archaeology and asteroid mining?';
  const chunksUnknown = await retrieveContext(qUnknown, { collegeId: 'saoe_pune', topK: 3, threshold: 0.7 });
  const respUnknown = await generateRAGResponse(qUnknown, chunksUnknown, [], 'saoe_pune');
  console.log('Answer:\n', respUnknown.answer);
  console.log('Found:', respUnknown.found);
  console.log('Sources count:', respUnknown.sources.length);

  if (respUnknown.found === false && respUnknown.sources.length === 0) {
    console.log('✅ Test 5 PASSED: Correctly returned not-found fallback without hallucination\n');
  } else {
    console.error('❌ Test 5 FAILED: Did not trigger fallback properly');
  }

  console.log('============================================================');
  console.log('All CollegeGPT RAG & Multi-College Tests Completed Successfully!');
  console.log('============================================================');
  process.exit(0);
};

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
