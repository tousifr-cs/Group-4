import React, { useState } from 'react';
import './CareerAdvice.css';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  tags: string[];
}

const CareerAdvice: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const articles: Article[] = [
    {
      id: 1,
      title: "10 Essential Skills Every Developer Needs in 2024",
      excerpt: "Stay ahead of the curve with these must-have technical and soft skills that will make you stand out in the competitive tech industry.",
      content: `The tech industry is evolving rapidly, and staying competitive requires a combination of technical expertise and soft skills. Here are the 10 essential skills every developer should master in 2024:

1. **Cloud Computing & DevOps**: Understanding AWS, Azure, or Google Cloud is crucial. Learn containerization with Docker and orchestration with Kubernetes.

2. **AI & Machine Learning Basics**: Even if you're not an ML engineer, understanding AI concepts and being able to work with AI tools is becoming essential.

3. **Cybersecurity Awareness**: Basic security practices, understanding common vulnerabilities, and implementing secure coding practices.

4. **Data Analysis**: Being able to work with data, understand analytics, and make data-driven decisions.

5. **Soft Skills**: Communication, teamwork, problem-solving, and adaptability are more important than ever.

6. **Continuous Learning**: The ability to quickly learn new technologies and frameworks.

7. **Remote Collaboration**: Working effectively in distributed teams using modern collaboration tools.

8. **API Design**: Understanding RESTful APIs, GraphQL, and microservices architecture.

9. **Testing & Quality Assurance**: Writing effective tests and understanding CI/CD pipelines.

10. **Business Acumen**: Understanding how your work impacts the business and end users.

Remember, it's not about mastering all of these at once, but about continuous improvement and staying relevant in an ever-changing industry.`,
      author: "Sarah Chen",
      date: "March 15, 2024",
      category: "Skills Development",
      readTime: "5 min read",
      tags: ["Development", "Skills", "Technology", "Career Growth"]
    },
    {
      id: 2,
      title: "How to Ace Your Technical Interview: A Complete Guide",
      excerpt: "Master the technical interview process with proven strategies, common question types, and preparation techniques that will boost your confidence.",
      content: `Technical interviews can be intimidating, but with proper preparation, you can approach them with confidence. Here's your complete guide to acing technical interviews:

**Before the Interview:**
- Research the company and role thoroughly
- Practice coding problems on platforms like LeetCode and HackerRank
- Review fundamental computer science concepts
- Prepare questions to ask the interviewer

**During the Interview:**
- Communicate your thought process clearly
- Ask clarifying questions before jumping into solutions
- Start with a brute force approach, then optimize
- Test your code with examples
- Handle edge cases appropriately

**Common Question Types:**
1. **Algorithm Problems**: Practice time and space complexity analysis
2. **System Design**: Focus on scalability, reliability, and maintainability
3. **Behavioral Questions**: Use the STAR method (Situation, Task, Action, Result)
4. **Technical Deep Dives**: Be prepared to discuss your past projects in detail

**Key Tips:**
- Practice coding on a whiteboard or in a simple text editor
- Time yourself during practice sessions
- Learn from each interview experience
- Don't be afraid to say "I don't know" - honesty is valued

Remember, technical interviews are not just about getting the right answer, but about demonstrating your problem-solving approach and communication skills.`,
      author: "Michael Rodriguez",
      date: "March 12, 2024",
      category: "Interview Prep",
      readTime: "7 min read",
      tags: ["Interviews", "Technical Skills", "Career Tips", "Preparation"]
    },
    {
      id: 3,
      title: "Building Your Personal Brand in the Tech Industry",
      excerpt: "Learn how to establish a strong personal brand that will open doors to new opportunities and help you stand out in the competitive tech market.",
      content: `In today's competitive tech industry, having a strong personal brand can be the difference between being overlooked and being sought after. Here's how to build and maintain your personal brand:

**Define Your Niche:**
- Identify your unique strengths and expertise
- Choose a specific area to focus on
- Understand your target audience
- Develop a clear value proposition

**Create Valuable Content:**
- Start a technical blog or YouTube channel
- Share insights on LinkedIn and Twitter
- Contribute to open source projects
- Speak at conferences and meetups
- Write technical articles and tutorials

**Network Strategically:**
- Attend industry events and conferences
- Join relevant online communities
- Connect with thought leaders in your field
- Participate in discussions and forums
- Offer help and mentorship to others

**Maintain Consistency:**
- Post regularly on your chosen platforms
- Keep your online presence professional
- Engage with your audience authentically
- Stay updated with industry trends
- Continuously improve your skills

**Measure Your Impact:**
- Track engagement metrics
- Monitor your online presence
- Gather feedback from your network
- Adjust your strategy based on results

Remember, building a personal brand takes time and consistency. Focus on providing value to others, and the opportunities will follow.`,
      author: "Emily Watson",
      date: "March 10, 2024",
      category: "Personal Branding",
      readTime: "6 min read",
      tags: ["Personal Brand", "Networking", "Career Growth", "Professional Development"]
    },
    {
      id: 4,
      title: "Transitioning from Junior to Senior Developer",
      excerpt: "Navigate the challenging transition from junior to senior developer with practical advice on skill development, leadership, and career advancement.",
      content: `The transition from junior to senior developer is one of the most challenging and rewarding phases of your career. Here's how to navigate this transition successfully:

**Technical Excellence:**
- Master your primary programming language and framework
- Learn multiple technologies and understand trade-offs
- Develop expertise in system design and architecture
- Understand performance optimization and scalability
- Stay current with industry best practices

**Leadership Skills:**
- Mentor junior developers and help them grow
- Lead technical discussions and decision-making
- Take ownership of complex projects
- Collaborate effectively with cross-functional teams
- Communicate technical concepts to non-technical stakeholders

**Business Acumen:**
- Understand how your work impacts business goals
- Learn about project management and delivery
- Develop cost-benefit analysis skills
- Understand user needs and market requirements
- Contribute to strategic planning

**Soft Skills Development:**
- Improve communication and presentation skills
- Develop conflict resolution abilities
- Learn to give and receive constructive feedback
- Build strong relationships with stakeholders
- Practice emotional intelligence and empathy

**Career Strategy:**
- Set clear goals and create a development plan
- Seek out challenging projects and responsibilities
- Build a strong professional network
- Consider certifications and advanced education
- Document your achievements and contributions

Remember, becoming a senior developer is not just about technical skills, but about becoming a well-rounded professional who can lead, mentor, and contribute to business success.`,
      author: "David Kim",
      date: "March 8, 2024",
      category: "Career Growth",
      readTime: "8 min read",
      tags: ["Career Growth", "Leadership", "Senior Developer", "Professional Development"]
    },
    {
      id: 5,
      title: "Remote Work Best Practices for Developers",
      excerpt: "Master the art of remote work with productivity tips, communication strategies, and work-life balance techniques tailored for developers.",
      content: `Remote work has become the new normal for many developers, but it comes with unique challenges and opportunities. Here are the best practices to thrive in a remote work environment:

**Setting Up Your Workspace:**
- Create a dedicated, distraction-free workspace
- Invest in ergonomic furniture and equipment
- Ensure reliable internet and power backup
- Set up proper lighting and ventilation
- Keep your workspace organized and clean

**Time Management:**
- Establish a consistent daily routine
- Use time-blocking techniques
- Set clear boundaries between work and personal time
- Take regular breaks and practice the Pomodoro technique
- Track your productivity and adjust accordingly

**Communication Strategies:**
- Over-communicate with your team
- Use appropriate communication channels for different purposes
- Schedule regular check-ins and stand-ups
- Document decisions and discussions thoroughly
- Be proactive in reaching out to colleagues

**Collaboration Tools:**
- Master your team's collaboration platforms
- Use version control effectively
- Implement proper code review processes
- Utilize project management tools
- Leverage video conferencing for complex discussions

**Work-Life Balance:**
- Set clear work hours and stick to them
- Take advantage of flexible scheduling
- Stay connected with colleagues socially
- Practice self-care and maintain hobbies
- Separate your work and personal spaces

**Professional Development:**
- Attend virtual conferences and meetups
- Participate in online learning communities
- Build your remote work skills
- Network with other remote professionals
- Stay updated with remote work trends

Remember, remote work success requires discipline, communication, and a commitment to maintaining both productivity and well-being.`,
      author: "Lisa Thompson",
      date: "March 5, 2024",
      category: "Remote Work",
      readTime: "6 min read",
      tags: ["Remote Work", "Productivity", "Work-Life Balance", "Communication"]
    }
  ];

  const categories = ['all', ...Array.from(new Set(articles.map(article => article.category)))];

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
  };

  const handleBackToList = () => {
    setSelectedArticle(null);
  };

  if (selectedArticle) {
    return (
      <div className="career-advice-container">
        <div className="article-content">
          <button className="back-button" onClick={handleBackToList}>
            ← Back to Articles
          </button>
          
          <article className="full-article">
            <header className="article-header">
              <div className="article-meta">
                <span className="category">{selectedArticle.category}</span>
                <span className="read-time">{selectedArticle.readTime}</span>
              </div>
              <h1>{selectedArticle.title}</h1>
              <div className="article-info">
                <span className="author">By {selectedArticle.author}</span>
                <span className="date">{selectedArticle.date}</span>
              </div>
              <div className="tags">
                {selectedArticle.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </header>
            
            <div className="article-body">
              {selectedArticle.content.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="career-advice-container">
      <div className="career-advice-content">
        <header className="page-header">
          <h1>Career Advice</h1>
          <p>Expert insights, tips, and strategies to advance your career in tech</p>
        </header>

        <div className="category-filter">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All Articles' : category}
            </button>
          ))}
        </div>

        <div className="articles-grid">
          {filteredArticles.map(article => (
            <article key={article.id} className="article-card" onClick={() => handleArticleClick(article)}>
              <div className="article-header">
                <div className="article-meta">
                  <span className="category">{article.category}</span>
                  <span className="read-time">{article.readTime}</span>
                </div>
                <h2>{article.title}</h2>
                <p className="excerpt">{article.excerpt}</p>
              </div>
              
              <div className="article-footer">
                <div className="article-info">
                  <span className="author">By {article.author}</span>
                  <span className="date">{article.date}</span>
                </div>
                <div className="tags">
                  {article.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CareerAdvice;
