document.addEventListener('DOMContentLoaded', function() {
    // Initialize Canvas
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const predictionsDiv = document.getElementById('predictions');
    const modelSelector = document.getElementById('modelSelector');

    // Canvas Setup
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 15;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Drawing State
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Event Listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch support
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', stopDrawing);

    // Keyboard support
    document.addEventListener('keydown', handleKeyPress);

    function handleTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const mouseEvent = {
            offsetX: touch.clientX - rect.left,
            offsetY: touch.clientY - rect.top
        };
        if (e.type === 'touchstart') {
            startDrawing(mouseEvent);
        } else if (e.type === 'touchmove') {
            draw(mouseEvent);
        }
    }

    function handleKeyPress(e) {
        if (e.key === 'n' || e.key === 'N') {
            clearCanvas();
        }
    }

    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function draw(e) {
        if (!isDrawing) return;
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function stopDrawing() {
        isDrawing = false;
    }

    // Clear Canvas
    window.clearCanvas = function() {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        predictionsDiv.innerHTML = '';
    }

    // Prediction Function
    window.predict = async function() {
        const {minX, minY, maxX, maxY} = getBoundingBox();
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = tempCanvas.height = 28;
        
        tempCtx.drawImage(
            canvas, 
            minX, minY, 
            maxX - minX, maxY - minY,
            0, 0,
            28, 28
        );
        
        const imgData = tempCanvas.toDataURL();
        
        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    image: imgData,
                    model: modelSelector.value 
                })
            });
            
            const predictions = await response.json();
            if (predictions.error) {
                throw new Error(predictions.error);
            }
            displayPredictions(predictions);
        } catch (error) {
            console.error('Prediction error:', error);
            predictionsDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        }
    }

    function getBoundingBox() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        
        let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
        
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const idx = (y * canvas.width + x) * 4;
                if (pixels[idx] !== 0) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }
        
        const padding = 10;
        minX = Math.max(0, minX - padding);
        minY = Math.max(0, minY - padding);
        maxX = Math.min(canvas.width, maxX + padding);
        maxY = Math.min(canvas.height, maxY + padding);
        
        return {minX, minY, maxX, maxY};
    }

    function displayPredictions(predictions) {
        let html = '<h3>Predictions:</h3>';
        for (const [model, result] of Object.entries(predictions)) {
            html += `<p><strong>${model}:</strong> ${result}</p>`;
        }
        predictionsDiv.innerHTML = html;
    }
});