async function test() {
    try {
        const response = await fetch('https://doebrasil.onrender.com/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: "Test User",
                email: "farodeso@gmail.com",
                password: "password123",
                city: "Natividade",
                state: "TO"
            })
        });
        
        const data = await response.text();
        console.log("Status:", response.status);
        console.log("Body:", data);
    } catch (error) {
        console.log("Error:", error.message);
    }
}

test();
