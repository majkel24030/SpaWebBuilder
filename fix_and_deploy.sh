#!/bin/bash

echo "🚀 Fixing deployment issues and moving away from Vercel..."

# Clean up build artifacts that shouldn't be committed
echo "🧹 Cleaning up build artifacts..."
rm -rf frontend/dist/
rm -rf frontend/node_modules/

# Add gitignore entries to prevent committing build artifacts
echo "📝 Updating .gitignore..."
cat >> .gitignore << EOF

# Frontend build artifacts
frontend/dist/
frontend/node_modules/
frontend/package-lock.json

# Backend artifacts
backend/__pycache__/
backend/.env

# IDE files
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db
EOF

# Stage the important changes
echo "📦 Staging changes for commit..."
git add frontend/package.json
git add frontend/src/views/Register.tsx
git add DEPLOYMENT_SOLUTIONS.md
git add railway.yaml
git add .gitignore
git add fix_and_deploy.sh

# Reset the unstaged dist files
git restore frontend/dist/

# Check git status
echo "📊 Current git status:"
git status --short

echo ""
echo "✅ Repository cleaned up!"
echo ""
echo "🎯 Next steps:"
echo "1. Commit the fixes: git commit -m 'Fix TypeScript errors and prepare for proper deployment'"
echo "2. Push changes: git push"
echo "3. Choose deployment platform:"
echo "   - 🌟 Render (recommended): Already configured with render.yaml"
echo "   - 🚀 Railway (alternative): Use railway.yaml config"
echo ""
echo "📖 Read DEPLOYMENT_SOLUTIONS.md for detailed instructions on:"
echo "   - How to stop Vercel auto-deployments"
echo "   - Step-by-step deployment guides"
echo "   - Environment variable configuration"
echo ""
echo "🔧 To deploy to Render:"
echo "   1. Go to render.com → New + → Blueprint"
echo "   2. Connect your GitHub repo"
echo "   3. Render will auto-detect render.yaml"
echo ""
echo "🔧 To deploy to Railway:"
echo "   1. npm install -g @railway/cli"
echo "   2. railway login"
echo "   3. railway up"
echo ""
echo "🎉 Your project is now ready for proper deployment!"