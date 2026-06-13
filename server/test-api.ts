async function testApi() {
    console.log('Testing forgot-password API...');
    const start = Date.now();
    try {
        const res = await fetch('https://doebrasil.onrender.com/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'mrbatista274@gmail.com' })
        });
        const data = await res.text();
        console.log('Response status:', res.status);
        console.log('Response data:', data);
    } catch (e: any) {
        console.error('Error:', e.message);
    }
    console.log('Time taken:', Date.now() - start, 'ms');
}

testApi();
