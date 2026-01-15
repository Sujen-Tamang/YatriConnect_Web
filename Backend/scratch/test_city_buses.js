import fetch from 'node-fetch';

async function test() {
    try {
        const response = await fetch('http://localhost:4000/api/v1/city-buses/active');
        const data = await response.json();
        console.log('Active City Buses:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error fetching city buses:', error);
    }
}

test();
