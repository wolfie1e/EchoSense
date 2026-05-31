#!/bin/sh
set -e

# EchoSense Frontend Docker Entrypoint
# Handles environment variable injection and nginx startup

echo "🚀 Starting EchoSense Frontend..."

# Function to replace environment variables in built files
replace_env_vars() {
    echo "📝 Injecting environment variables..."
    
    # Find all JS files in the build directory
    find /usr/share/nginx/html -name "*.js" -type f -exec sh -c '
        for file do
            # Replace environment variable placeholders
            sed -i "s|VITE_API_BASE_URL_PLACEHOLDER|${VITE_API_BASE_URL:-http://localhost:8000/api}|g" "$file"
            sed -i "s|VITE_APP_NAME_PLACEHOLDER|${VITE_APP_NAME:-EchoSense}|g" "$file"
            sed -i "s|VITE_APP_VERSION_PLACEHOLDER|${VITE_APP_VERSION:-1.0.0}|g" "$file"
        done
    ' sh {} +
    
    echo "✅ Environment variables injected successfully"
}

# Function to validate nginx configuration
validate_nginx() {
    echo "🔍 Validating nginx configuration..."
    nginx -t
    echo "✅ Nginx configuration is valid"
}

# Function to create necessary directories
setup_directories() {
    echo "📁 Setting up directories..."
    mkdir -p /var/cache/nginx
    mkdir -p /var/log/nginx
    echo "✅ Directories created"
}

# Main execution
main() {
    echo "🌟 EchoSense Frontend v${VITE_APP_VERSION:-1.0.0}"
    echo "🔗 API Base URL: ${VITE_API_BASE_URL:-http://localhost:8000/api}"
    
    setup_directories
    replace_env_vars
    validate_nginx
    
    echo "🎉 EchoSense Frontend ready!"
    echo "📡 Starting nginx server..."
    
    # Execute the main command
    exec "$@"
}

# Run main function
main "$@"
