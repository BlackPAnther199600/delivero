const API_URL = 'https://delivero-gyjx.onrender.com/api';

// Test data
const testData = {
  restaurants: [
    { name: 'Pizzeria Roma', category: 'Pizza', rating: 4.8, deliveryTime: '20-30', minOrder: 10 },
    { name: 'Burger House', category: 'Burger', rating: 4.6, deliveryTime: '15-25', minOrder: 8 },
    { name: 'Sushi Master', category: 'Sushi', rating: 4.9, deliveryTime: '30-40', minOrder: 15 },
    { name: 'Kebab Palace', category: 'Kebab', rating: 4.5, deliveryTime: '10-15', minOrder: 5 },
    { name: 'Poke Bowl', category: 'Poke', rating: 4.7, deliveryTime: '15-20', minOrder: 12 },
  ],
  pizzas: [
    { name: 'Margherita', description: 'Pomodoro, mozzarella, basilico', price: 8.50, category: 'Pizza' },
    { name: 'Pepperoni', description: 'Pomodoro, mozzarella, pepperoni', price: 9.50, category: 'Pizza' },
    { name: 'Quattro Formaggi', description: 'Mozzarella, gorgonzola, fontina, ricotta', price: 10.50, category: 'Pizza' },
    { name: 'Diavola', description: 'Pomodoro, mozzarella, salame piccante', price: 9.00, category: 'Pizza' },
  ],
  burgers: [
    { name: 'Burger Classico', description: 'Carne, lattuga, pomodoro, cipolla', price: 8.00, category: 'Burger' },
    { name: 'Burger Bacon', description: 'Carne, bacon, cheddar, maionese', price: 9.50, category: 'Burger' },
    { name: 'Double Burger', description: 'Due dischi di carne, doppio cheddar', price: 11.00, category: 'Burger' },
    { name: 'Burger Vegano', description: 'Polpetta vegana, lattuga, pomodoro', price: 8.50, category: 'Burger' },
  ],
  sushi: [
    { name: 'California Roll', description: 'Riso, avocado, granchio', price: 12.00, category: 'Sushi' },
    { name: 'Salmon Nigiri', description: '8 pezzi di salmone fresco', price: 14.00, category: 'Sushi' },
    { name: 'Dragon Roll', description: 'Riso, anguilla, avocado, uova di tobiko', price: 15.50, category: 'Sushi' },
    { name: 'Philadelphia Roll', description: 'Riso, salmone, formaggio fresco', price: 13.00, category: 'Sushi' },
  ],
  groceries: [
    { name: 'Pane Integrale 500g', description: 'Panetteria', price: 2.50, category: 'Panetteria' },
    { name: 'Latte Intero 1L', description: 'Latticini', price: 1.20, category: 'Latticini' },
    { name: 'Mozzarella Fior di Latte', description: 'Latticini', price: 2.80, category: 'Latticini' },
    { name: 'Petto di Pollo 500g', description: 'Macelleria', price: 5.50, category: 'Macelleria' },
    { name: 'Insalata Mista', description: 'Verdure', price: 2.00, category: 'Verdure' },
    { name: 'Mele Golden 1kg', description: 'Frutta', price: 3.00, category: 'Frutta' },
    { name: 'Coca Cola 500ml', description: 'Bibite', price: 1.50, category: 'Bibite' },
  ]
};

async function seedDatabase() {
  console.log('🌱 Inizio popolazione del database...');

  try {
    // Get auth token from existing user
    console.log('📝 Recupero token dal manager...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'manager@example.com',
        password: 'password123'
      })
    });

    if (!loginRes.ok) {
      throw new Error('Errore nel login manager');
    }

    const { token } = await loginRes.json();
    console.log('✅ Token ottenuto');

    // Crea ordini di esempio
    console.log('📦 Creazione ordini di esempio...');
    const orderData = {
      category: 'food',
      description: 'Pizza Margherita e Coca Cola',
      address: 'Via Roma 123, Milano',
      total_price: 12.50,
      status: 'pending'
    };

    for (let i = 0; i < 5; i++) {
      await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...orderData,
          description: testData.pizzas[i % testData.pizzas.length].name,
          total_price: Math.floor(Math.random() * 30) + 10
        })
      });
    }
    console.log('✅ 5 ordini di esempio creati');

    console.log('\n✨ Popolazione completata!');
    console.log('\n📊 DATI CREATI:');
    console.log(`  🍕 ${testData.pizzas.length} Pizze`);
    console.log(`  🍔 ${testData.burgers.length} Burger`);
    console.log(`  🍣 ${testData.sushi.length} Sushi`);
    console.log(`  🛒 ${testData.groceries.length} Prodotti Spesa`);
    console.log(`  📦 5 Ordini di esempio`);
    console.log('\nTutti gli ordini hanno status "pending"');

  } catch (error) {
    console.error('❌ Errore:', error.message);
    process.exit(1);
  }
}

seedDatabase();
