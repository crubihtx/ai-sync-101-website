/**
 * BLOG PUBLISH API - VERCEL SERVERLESS FUNCTION
 * Receives blog post data and commits to GitHub repo
 * GitHub token stored server-side as environment variable
 */

export const config = {
  runtime: 'nodejs',
};

const GITHUB_REPO = 'crubihtx/ai-sync-101-website';
const GITHUB_BRANCH = 'main';
const POSTS_PATH = 'blog/posts';

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://wonderful-moss-0913b4a10.6.azurestaticapps.net',
  'https://www.aisync101.com',
  'https://aisync101.com',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
];

function getCorsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

// Simple auth check - verify the admin password hash
const ADMIN_EMAIL = 't@taylorrubi.com';
const PASSWORD_HASH = '3ef3c1745aa5cb5ec2a8e57f0c6d5341b2fd2618234d68659bde88f86af66226';

async function githubApiRequest(path, method, body, token) {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
    {
      method,
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'AI-Sync-101-Blog-Editor',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `GitHub API error: ${response.status}`);
  }

  return response.json();
}

async function getFileSha(path, token) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'AI-Sync-101-Blog-Editor',
        },
      }
    );
    if (response.ok) {
      const data = await response.json();
      return data.sha;
    }
  } catch (e) {}
  return null;
}

async function getFileContent(path, token) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'AI-Sync-101-Blog-Editor',
        },
      }
    );
    if (response.ok) {
      const data = await response.json();
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return { content: JSON.parse(content), sha: data.sha };
    }
  } catch (e) {}
  return null;
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const cors = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, cors);
    res.end();
    return;
  }

  // Set CORS headers
  Object.entries(cors).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check GitHub token is configured
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    return res.status(500).json({ error: 'Server not configured. GITHUB_TOKEN missing.' });
  }

  try {
    const { action, email, passwordHash, post, imageData, imagePath } = req.body;

    // Verify admin auth
    if (!email || !passwordHash) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (email.toLowerCase() !== ADMIN_EMAIL || passwordHash !== PASSWORD_HASH) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // ==========================================
    // ACTION: PUBLISH POST
    // ==========================================
    if (action === 'publish') {
      if (!post || !post.slug || !post.title || !post.content) {
        return res.status(400).json({ error: 'Missing required post fields' });
      }

      // 1. Create/update the post JSON file
      const postData = {
        slug: post.slug,
        title: post.title,
        category: post.category || 'Operations',
        excerpt: post.excerpt || '',
        author: post.author || 'AI Sync 101',
        date: post.date || new Date().toISOString().split('T')[0],
        readTime: post.readTime || '5 min read',
        content: post.content,
        seoTitle: post.seoTitle || '',
        seoDescription: post.seoDescription || '',
        seoKeyword: post.seoKeyword || '',
        featuredImage: post.featuredImage || '',
      };

      const postPath = `${POSTS_PATH}/${post.slug}.json`;
      const postContent = Buffer.from(JSON.stringify(postData, null, 2), 'utf-8').toString('base64');
      const postSha = await getFileSha(postPath, githubToken);

      const postBody = {
        message: `Publish blog post: ${post.title}`,
        content: postContent,
        branch: GITHUB_BRANCH,
      };
      if (postSha) postBody.sha = postSha;

      await githubApiRequest(postPath, 'PUT', postBody, githubToken);

      // 2. Update the index.json
      const indexPath = `${POSTS_PATH}/index.json`;
      let indexData = { posts: [] };
      const indexFile = await getFileContent(indexPath, githubToken);

      if (indexFile) {
        indexData = indexFile.content;
      }

      // Remove existing entry for this slug, then add at top
      indexData.posts = indexData.posts.filter((p) => p.slug !== post.slug);
      indexData.posts.unshift({
        slug: post.slug,
        title: post.title,
        category: post.category || 'Operations',
        excerpt: post.excerpt || '',
        author: post.author || 'AI Sync 101',
        date: post.date || new Date().toISOString().split('T')[0],
        readTime: post.readTime || '5 min read',
        featuredImage: post.featuredImage || '',
        featured: post.featured || false,
      });

      const indexContent = Buffer.from(JSON.stringify(indexData, null, 2), 'utf-8').toString('base64');
      const indexBody = {
        message: `Update blog index: ${post.title}`,
        content: indexContent,
        branch: GITHUB_BRANCH,
      };
      if (indexFile) indexBody.sha = indexFile.sha;

      await githubApiRequest(indexPath, 'PUT', indexBody, githubToken);

      return res.status(200).json({
        success: true,
        message: 'Post published! It will be live in ~1 minute.',
        slug: post.slug,
      });
    }

    // ==========================================
    // ACTION: UPLOAD IMAGE
    // ==========================================
    if (action === 'upload-image') {
      if (!imageData || !imagePath) {
        return res.status(400).json({ error: 'Missing image data or path' });
      }

      // imageData should be base64 encoded (without the data:image prefix)
      const cleanBase64 = imageData.includes(',') ? imageData.split(',')[1] : imageData;

      const imgSha = await getFileSha(imagePath, githubToken);
      const imgBody = {
        message: `Add blog image: ${imagePath.split('/').pop()}`,
        content: cleanBase64,
        branch: GITHUB_BRANCH,
      };
      if (imgSha) imgBody.sha = imgSha;

      await githubApiRequest(imagePath, 'PUT', imgBody, githubToken);

      return res.status(200).json({
        success: true,
        message: 'Image uploaded!',
        path: `/${imagePath}`,
      });
    }

    return res.status(400).json({ error: 'Invalid action. Use "publish" or "upload-image".' });
  } catch (error) {
    console.error('Publish error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
