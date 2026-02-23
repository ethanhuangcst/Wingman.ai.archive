const mysql = require('mysql2/promise');

async function seedPrompts() {
  try {
    // Create database connection pool
    const pool = mysql.createPool({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'password',
      database: 'wingman_db',
    });

    const connection = await pool.getConnection();

    try {
      // First, let's find the user ID for me@ethanhuang.com
      const [users] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        ['me@ethanhuang.com']
      );

      if (!Array.isArray(users) || users.length === 0) {
        console.error('User me@ethanhuang.com not found');
        return;
      }

      const userId = users[0].id;
      console.log(`Found user ID: ${userId} for me@ethanhuang.com`);

      // Clear existing prompts for this user
      await connection.execute('DELETE FROM prompts WHERE user_id = ?', [userId]);
      console.log('Cleared existing prompts for user');

      // Test prompts to insert
      const testPrompts = [
        { name: 'Math Problem Solver', text: 'Solve complex math problems step by step' },
        { name: 'Essay Writer', text: 'Write essays on various topics with proper structure' },
        { name: 'Code Generator', text: 'Generate code in different programming languages' },
        { name: 'Grammar Checker', text: 'Check grammar and spelling in text' },
        { name: 'Story Creator', text: 'Create interesting stories based on prompts' },
        { name: 'Business Plan', text: 'Help create business plans for startups' },
        { name: 'Travel Planner', text: 'Plan trips and itineraries for different destinations' },
        { name: 'Health Advisor', text: 'Provide general health and wellness advice' },
        { name: 'Fitness Coach', text: 'Create workout routines and fitness plans' },
        { name: 'Recipe Generator', text: 'Generate recipes based on ingredients' },
        { name: 'Job Application', text: 'Help with job applications and resumes' },
        { name: 'Language Tutor', text: 'Teach different languages with examples' },
        { name: 'Science Explainer', text: 'Explain complex scientific concepts simply' },
        { name: 'History Teacher', text: 'Provide historical facts and explanations' },
        { name: 'Art Critic', text: 'Analyze and critique works of art' },
        { name: 'Music Advisor', text: 'Recommend music based on preferences' },
        { name: 'Movie Reviewer', text: 'Review movies and provide recommendations' },
        { name: 'Book Summarizer', text: 'Summarize books and key points' },
        { name: 'Tech Support', text: 'Help troubleshoot common tech issues' },
        { name: 'Financial Advisor', text: 'Provide general financial advice' },
        { name: 'Career Coach', text: 'Help with career planning and advancement' },
        { name: 'Relationship Advisor', text: 'Provide relationship advice' },
        { name: 'Parenting Guide', text: 'Provide parenting tips and advice' },
        { name: 'Pet Care', text: 'Provide pet care tips and advice' },
        { name: 'Garden Planner', text: 'Help plan and maintain gardens' },
        { name: 'Home Decor', text: 'Provide home decor ideas and tips' },
        { name: 'Fashion Advisor', text: 'Provide fashion tips and advice' },
        { name: 'Social Media', text: 'Help create social media content' },
        { name: 'Public Speaking', text: 'Help prepare for public speaking' },
        { name: 'Debate Coach', text: 'Help prepare for debates and arguments' }
      ];

      console.log(`Inserting ${testPrompts.length} test prompts for user ID: ${userId}`);
      
      for (let i = 0; i < testPrompts.length; i++) {
        const prompt = testPrompts[i];
        const promptId = `prompt_${i + 1}_${Date.now()}_${userId}`;
        await connection.execute(
          'INSERT INTO prompts (id, user_id, prompt_name, prompt_text) VALUES (?, ?, ?, ?)',
          [promptId, userId, prompt.name, prompt.text]
        );
        console.log(`Inserted prompt ${i + 1}: ${prompt.name}`);
      }

      console.log(`\n✅ ${testPrompts.length} test prompts inserted successfully for me@ethanhuang.com`);

    } finally {
      connection.release();
      await pool.end();
    }

  } catch (error) {
    console.error('Error seeding prompts:', error);
  }
}

seedPrompts();
