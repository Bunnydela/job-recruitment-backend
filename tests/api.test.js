const assert = require('assert');

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const body = await res.json();
  return { status: res.status, body };
}

async function runTests() {
  console.log(`Running Job Recruitment API tests against ${BASE_URL}...\n`);
  const suffix = Date.now();

  // 1. Register Employer
  const empReg = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Test Employer',
      email: `employer_${suffix}@test.com`,
      password: 'Password123',
      role: 'employer',
    }),
  });
  assert.strictEqual(empReg.status, 201);
  assert.strictEqual(empReg.body.success, true);
  const employerToken = empReg.body.data.token;
  console.log('1. [PASS] Employer registration');

  // 2. Register Candidate
  const candReg = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Test Candidate',
      email: `candidate_${suffix}@test.com`,
      password: 'Password123',
      role: 'candidate',
    }),
  });
  assert.strictEqual(candReg.status, 201);
  const candidateToken = candReg.body.data.token;
  console.log('2. [PASS] Candidate registration');

  // 3. Authorization check: Candidate cannot post a job
  const forbiddenJob = await request('/jobs', {
    method: 'POST',
    headers: { Authorization: `Bearer ${candidateToken}` },
    body: JSON.stringify({
      title: 'Unauthorized Job',
      description: 'Should fail',
      location: 'Remote',
    }),
  });
  assert.strictEqual(forbiddenJob.status, 403);
  console.log('3. [PASS] Role authorization blocks candidate from posting jobs (403)');

  // 4. Employer creates a job
  const jobCreate = await request('/jobs', {
    method: 'POST',
    headers: { Authorization: `Bearer ${employerToken}` },
    body: JSON.stringify({
      title: 'Backend Node.js Engineer',
      description: 'Build scalable REST APIs',
      location: 'Calabar / Remote',
      salaryRange: '$45,000 - $60,000',
    }),
  });
  assert.strictEqual(jobCreate.status, 201);
  const jobId = jobCreate.body.data._id;
  console.log('4. [PASS] Employer creates job listing');

  // 5. Public search for jobs
  const searchJobs = await request('/jobs?search=Node.js');
  assert.strictEqual(searchJobs.status, 200);
  assert.ok(searchJobs.body.data.some((j) => j._id === jobId));
  console.log('5. [PASS] Public job search & filtering');

  // 6. Candidate applies to job
  const applyRes = await request('/applications', {
    method: 'POST',
    headers: { Authorization: `Bearer ${candidateToken}` },
    body: JSON.stringify({
      job: jobId,
      coverLetter: 'Excited to contribute to your backend engineering team.',
    }),
  });
  assert.strictEqual(applyRes.status, 201);
  const applicationId = applyRes.body.data._id;
  console.log('6. [PASS] Candidate submits job application');

  // 7. Duplicate application rejected
  const dupApply = await request('/applications', {
    method: 'POST',
    headers: { Authorization: `Bearer ${candidateToken}` },
    body: JSON.stringify({ job: jobId }),
  });
  assert.strictEqual(dupApply.status, 409);
  console.log('7. [PASS] Duplicate application prevented (409)');

  // 8. Employer updates application status
  const statusUpdate = await request(`/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${employerToken}` },
    body: JSON.stringify({ status: 'reviewed' }),
  });
  assert.strictEqual(statusUpdate.status, 200);
  assert.strictEqual(statusUpdate.body.data.status, 'reviewed');
  console.log('8. [PASS] Employer updates application status to reviewed');

  // 9. Clean up test job
  const delJob = await request(`/jobs/${jobId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${employerToken}` },
  });
  assert.strictEqual(delJob.status, 200);
  console.log('9. [PASS] Employer deletes test job');

  console.log('\nAll 9 end-to-end API tests passed!');
}

runTests().catch((err) => {
  console.error('\nTest failed:', err);
  process.exit(1);
});
