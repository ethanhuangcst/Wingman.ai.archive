// Test script to verify URL construction logic

// URL construction function (copied from makeApiCall)
function constructEndpointUrl(baseUrl) {
  let endpointUrl = baseUrl;
  // Remove trailing slash if present
  endpointUrl = endpointUrl.replace(/\/$/, '');
  // Check if /chat/completions is already in the URL
  if (!endpointUrl.includes('/chat/completions')) {
    endpointUrl += '/chat/completions';
  }
  return endpointUrl;
}

// Test cases
const testCases = [
  'https://openaiss.com/v1',
  'https://openaiss.com',
  'https://openaiss.com/v1/',
  'https://openaiss.com/chat/completions',
  'https://openaiss.com/v1/chat/completions',
  'https://dashscope.aliyuncs.com/compatible-mode/v1',
  'https://dashscope.aliyuncs.com/v1'
];

// Run tests
console.log('Testing URL construction logic:');
console.log('================================');

testCases.forEach((baseUrl, index) => {
  const result = constructEndpointUrl(baseUrl);
  console.log(`Test ${index + 1}:`);
  console.log(`Input:    ${baseUrl}`);
  console.log(`Output:   ${result}`);
  console.log('--------------------------------');
});

console.log('All tests completed!');

// Test the multiple base URL scenario
console.log('\nTesting multiple base URL scenario:');
console.log('==================================');

const gptBaseUrls = [
  'https://openaiss.com/v1',
  'https://openaiss.com',
  'https://api.openai.com/v1'
];

console.log('GPT-5.2-all base URLs:');
gptBaseUrls.forEach((url, index) => {
  const constructedUrl = constructEndpointUrl(url);
  console.log(`${index + 1}. ${url} → ${constructedUrl}`);
});

const qwenBaseUrls = [
  'https://dashscope.aliyuncs.com/compatible-mode/v1',
  'https://dashscope.aliyuncs.com/v1'
];

console.log('\nQwen-plus base URLs:');
qwenBaseUrls.forEach((url, index) => {
  const constructedUrl = constructEndpointUrl(url);
  console.log(`${index + 1}. ${url} → ${constructedUrl}`);
});
