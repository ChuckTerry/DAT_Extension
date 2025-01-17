/**
 * Original code credit to mirko-pace on github. Thanks for the awesome code.
 * https://github.com/mirko-pace/copythatcode/blob/main/content.js
 */

// Function to copy text to clipboard
function copyTextToClipboard(text) {
    text = removeNoBreakSpace(text);
    navigator.clipboard.writeText(text).then(
        function() { },
        function (error) {
            tooltip.innerText = 'Error copying Code';
            console.error('Error copying text: ', error);
        }
    );
}

// Create the tooltip element and style it
const tooltip = document.createElement('div');
tooltip.id = 'copy-tooltip';
tooltip.innerText = 'Click to copy';
tooltip.classList.add('hidden');
document.body.appendChild(tooltip);

// Variable to hold timeout reference for tooltip
let tooltipTimeout;

// Event listener for mousemove to show tooltip near <pre> elements
document.addEventListener('mousemove', function (event) {
    const preElement = event.target.closest('pre');
    if (preElement) {
        clearTimeout(tooltipTimeout);
        // Show the tooltip after a delay of 100 millliseconds using a timeout
        tooltipTimeout = setTimeout(() => {
            tooltip.classList.remove('hidden');
            tooltip.style.left = `${event.clientX + 10}px`;
            tooltip.style.top = `${event.clientY - 20}px`;
        }, 100);
    } else {
        // Hide the tooltip if the cursor is not on a pre element
        clearTimeout(tooltipTimeout);
        tooltip.classList.add('hidden');
    }
});

// Event listener for click to copy code from <pre> element
document.addEventListener('click', function (event) {
    const preElement = event.target.closest('pre');
    if (preElement) {
        const code = preElement.innerText;
        copyTextToClipboard(code);
        tooltip.innerText = 'Code Copied!';
        // Reset tooltip text and display after 1 second
        setTimeout(() => {
            tooltip.textContent = 'Click to Copy'
            tooltip.classList.add('hidden');
        }, 1000);
    }
});

document.addEventListener('mouseover', function (event) {
    const preElement = event.target.closest('pre');
    if (preElement) {
        preElement.classList.add('glow');          
    }
});
        
document.addEventListener('mouseout', function (event) {
    const preElement = event.target.closest('pre');
    if (preElement) {
        preElement.classList.remove('glow');        
    }
});
