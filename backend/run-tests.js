// using native fetch

async function runTests() {
  console.log('\n--- STARTING TESTS ---\n');

  try {
    // TEST 1: SERVER ALIVE
    console.log('🧪 TEST 1: SERVER ALIVE');
    const res1 = await fetch('https://gravital-backend.onrender.com/');
    const text1 = await res1.text();
    if (text1 === 'API Running 🚀') console.log('✅ PASS: Express server running\n');
    else console.log('❌ FAIL\n');

    // TEST 2: ROUTES CONNECTED
    console.log('🧪 TEST 2: ROUTES CONNECTED');
    const res2 = await fetch('https://gravital-backend.onrender.com/api/auth/test');
    const text2 = await res2.text();
    if (text2 === 'Working') console.log('✅ PASS: Routes mounted correctly\n');
    else console.log('❌ FAIL\n');

    // Use test username
    const username = `testuser_${Date.now()}`;

    // TEST 5: REGISTER API
    console.log('🧪 TEST 5: REGISTER API');
    const res5 = await fetch('https://gravital-backend.onrender.com/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: '123456' })
    });
    const json5 = await res5.json();
    if (json5.success) console.log('✅ PASS: Registration successful\n');
    else console.log('❌ FAIL:', json5, '\n');

    // TEST 7: LOGIN API
    console.log('🧪 TEST 7: LOGIN API');
    const res7 = await fetch('https://gravital-backend.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: '123456' })
    });
    const json7 = await res7.json();
    if (json7.success) console.log('✅ PASS: Login successful\n');
    else console.log('❌ FAIL:', json7, '\n');

    // TEST 8: WRONG PASSWORD
    console.log('🧪 TEST 8: WRONG PASSWORD');
    const res8 = await fetch('https://gravital-backend.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: 'wrongpassword' })
    });
    const json8 = await res8.json();
    if (json8.error === 'Incorrect password.') console.log('✅ PASS: Prevented wrong password\n');
    else console.log('❌ FAIL:', json8, '\n');

    // TEST 9: NON-EXISTING USER
    console.log('🧪 TEST 9: NON-EXISTING USER');
    const res9 = await fetch('https://gravital-backend.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'random999_nonexistent', password: '123456' })
    });
    const json9 = await res9.json();
    if (json9.error === 'User not found. Please sign up.') console.log('✅ PASS: Prevented unknown user\n');
    else console.log('❌ FAIL:', json9, '\n');

    // TEST 10: SAVE GPA DATA
    console.log('🧪 TEST 10: SAVE GPA DATA');
    const dummyGpaData = { semesters: [{ semesterNumber: 1, gpa: 9.5 }] };
    const res10 = await fetch('https://gravital-backend.onrender.com/api/gpa/save-gpa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, gpaData: dummyGpaData })
    });
    const json10 = await res10.json();
    if (json10.success) console.log('✅ PASS: GPA data saved successfully\n');
    else console.log('❌ FAIL:', json10, '\n');

    // TEST 11: LOAD GPA DATA
    console.log('🧪 TEST 11: LOAD GPA DATA');
    const res11 = await fetch(`https://gravital-backend.onrender.com/api/gpa/${username}`);
    const json11 = await res11.json();
    if (json11.success && json11.gpaData?.semesters?.[0]?.gpa === 9.5) {
      console.log('✅ PASS: GPA data loaded and verified successfully\n');
    } else {
      console.log('❌ FAIL:', json11, '\n');
    }

    console.log('🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
  } catch (error) {
    console.error('Test execution failed:', error);
  }
}

runTests();
