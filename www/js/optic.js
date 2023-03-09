
var SUPABASE_URL = 'https://mustcmzsfjqsriltocne.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11c3RjbXpzZmpxc3JpbHRvY25lIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTkxMjg3MjYsImV4cCI6MTk3NDcwNDcyNn0.6tZJS9VFYvUJWRYxlGbZmFuD4cLOmcOjXwypjS2Z8Ag';
const options = {
schema: 'public',
headers: { 'x-my-custom-header': 'my-app-name' },
autoRefreshToken: true,
persistSession: true,
detectSessionInUrl: true
};
var supe = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, options);
