#!/bin/bash

# Vault Setup Script
# This script helps you copy your vault files to the app's public folder

echo "🔧 Vault Setup Script"
echo "====================="
echo ""

# Check if source vault path is provided
if [ -z "$1" ]; then
    echo "❌ Please provide the path to your vault folder"
    echo "Usage: ./setup_vault.sh /path/to/your/vault"
    echo ""
    echo "Example: ./setup_vault.sh ~/Documents/MyVault"
    exit 1
fi

SOURCE_VAULT="$1"
TARGET_VAULT="public/vault"

echo "📁 Source vault: $SOURCE_VAULT"
echo "📁 Target vault: $TARGET_VAULT"
echo ""

# Check if source vault exists
if [ ! -d "$SOURCE_VAULT" ]; then
    echo "❌ Source vault folder does not exist: $SOURCE_VAULT"
    exit 1
fi

# Create target directory structure
echo "📂 Creating target directory structure..."
mkdir -p "$TARGET_VAULT"/{Christianity/{Core,Additional},Ethics/{Core,Additional},Philosophy/{Core,Additional},General,"Exam Board Materials","Revision & Essays",Notes}

# Copy files
echo "📋 Copying vault files..."
echo ""

# Copy Christianity files
if [ -d "$SOURCE_VAULT/Christianity" ]; then
    echo "📚 Copying Christianity files..."
    cp -r "$SOURCE_VAULT/Christianity"/* "$TARGET_VAULT/Christianity/" 2>/dev/null || echo "   No Christianity files found"
fi

# Copy Ethics files
if [ -d "$SOURCE_VAULT/Ethics" ]; then
    echo "📚 Copying Ethics files..."
    cp -r "$SOURCE_VAULT/Ethics"/* "$TARGET_VAULT/Ethics/" 2>/dev/null || echo "   No Ethics files found"
fi

# Copy Philosophy files
if [ -d "$SOURCE_VAULT/Philosophy" ]; then
    echo "📚 Copying Philosophy files..."
    cp -r "$SOURCE_VAULT/Philosophy"/* "$TARGET_VAULT/Philosophy/" 2>/dev/null || echo "   No Philosophy files found"
fi

# Copy General files
if [ -d "$SOURCE_VAULT/General" ]; then
    echo "📚 Copying General files..."
    cp -r "$SOURCE_VAULT/General"/* "$TARGET_VAULT/General/" 2>/dev/null || echo "   No General files found"
fi

# Copy Exam Board Materials
if [ -d "$SOURCE_VAULT/Exam Board Materials" ]; then
    echo "📚 Copying Exam Board Materials..."
    cp -r "$SOURCE_VAULT/Exam Board Materials"/* "$TARGET_VAULT/Exam Board Materials/" 2>/dev/null || echo "   No Exam Board Materials found"
fi

# Copy Revision & Essays
if [ -d "$SOURCE_VAULT/Revision & Essays" ]; then
    echo "📚 Copying Revision & Essays..."
    cp -r "$SOURCE_VAULT/Revision & Essays"/* "$TARGET_VAULT/Revision & Essays/" 2>/dev/null || echo "   No Revision & Essays found"
fi

# Copy Notes
if [ -d "$SOURCE_VAULT/Notes" ]; then
    echo "📚 Copying Notes..."
    cp -r "$SOURCE_VAULT/Notes"/* "$TARGET_VAULT/Notes/" 2>/dev/null || echo "   No Notes found"
fi

echo ""
echo "✅ Vault setup complete!"
echo ""
echo "📊 Summary:"
echo "   - Vault files copied to: $TARGET_VAULT"
echo "   - Files are now accessible via: http://localhost:5173/vault/"
echo ""
echo "🚀 Next steps:"
echo "   1. Start your development server: npm run dev"
echo "   2. Test the vault integration in your app"
echo "   3. Check browser console for vault loading messages"
echo ""
echo "📝 Note: Make sure your JSON files follow the expected format:"
echo "   - Each file should contain a 'chunks' array"
echo "   - Each chunk should have: id, content, source, page, title, metadata"
echo "" 