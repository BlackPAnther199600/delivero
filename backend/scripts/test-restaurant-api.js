// Test the restaurant API directly
async function testRestaurantAPI() {
  try {
    console.log('Testing restaurant API...');

    // Test 1: Get all restaurants
    console.log('\n=== Testing GET /restaurants ===');
    const allRestaurants = await fetch('https://delivero-gyjx.onrender.com/api/restaurants');
    const allData = await allRestaurants.json();
    console.log('All restaurants:', JSON.stringify(allData, null, 2));

    // Test 2: Get restaurant 3
    console.log('\n=== Testing GET /restaurants/3 ===');
    const restaurant3 = await fetch('https://delivero-gyjx.onrender.com/api/restaurants/3');
    const restData = await restaurant3.json();
    console.log('Restaurant 3:', JSON.stringify(restData, null, 2));

    // Test 3: Get categories
    console.log('\n=== Testing GET /restaurants/categories ===');
    const categories = await fetch('https://delivero-gyjx.onrender.com/api/restaurants/categories');
    const catData = await categories.json();
    console.log('Categories:', JSON.stringify(catData, null, 2));

  } catch (error) {
    console.error('API Test Error:', error);
  }
}

testRestaurantAPI();
