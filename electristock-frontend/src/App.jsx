import { useEffect, useState } from 'react';

function App() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('/api')
            .then((response) => response.text())
            .then((data) => setMessage(data))
            .catch((error) => console.error('Error fetching data:', error));
    }, []);

    return (
        <div>
            <h1>ElectriStock Frontend</h1>
            <p>{message}</p>
        </div>
    );

}

export default App;
