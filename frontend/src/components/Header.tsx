'use client';

import { useState } from 'react';
import { Container } from './ui/container';
import { Button } from './ui/button';
import { Menu, X, Moon, Sun, Settings, LogOut, User, Globe, Music, Film, Book } from 'lucide-react';
import Link from 'next/link';
import { useAuthContext } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, signOut } = useAuthContext();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="py-4 border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <Container>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center">
              <Globe className="h-6 w-6 text-qloo-yellow mr-2" />
              <span className="font-bold text-2xl">
                <span className="gradient-text">Curio</span>
              </span>
            </div>
            <span className="bg-qloo-teal text-qloo-black text-xs px-2 py-1 rounded-full">Taste AI™</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-foreground hover:text-qloo-yellow transition-colors flex items-center gap-1">
              <Globe className="h-4 w-4" />
              <span>Discover</span>
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-qloo-teal transition-colors flex items-center gap-1">
              <Music className="h-4 w-4" />
              <span>Music</span>
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-qloo-teal transition-colors flex items-center gap-1">
              <Film className="h-4 w-4" />
              <span>Movies</span>
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-qloo-teal transition-colors flex items-center gap-1">
              <Book className="h-4 w-4" />
              <span>Books</span>
            </Link>
            <Link href="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
              <Settings className="h-4 w-4" />
            </Link>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="text-sm flex items-center gap-2 border border-qloo-teal/30 rounded-full pl-2 pr-1 py-1">
                  <User className="h-4 w-4 text-qloo-teal" />
                  <span className="font-medium">{user?.user_metadata?.full_name || user?.email}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-full hover:bg-qloo-teal/10"
                    onClick={handleSignOut}
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Link href="/signin">
                  <Button variant="outline" size="sm" className="border-qloo-teal text-foreground hover:bg-qloo-teal/10">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-qloo-yellow text-qloo-black hover:bg-qloo-yellow/90">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t mt-4">
            <nav className="flex flex-col gap-4">
              <Link 
                href="/" 
                className="text-foreground hover:text-qloo-yellow transition-colors flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Globe className="h-5 w-5" />
                <span>Discover</span>
              </Link>
              <Link 
                href="/about" 
                className="text-muted-foreground hover:text-qloo-teal transition-colors flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Music className="h-5 w-5" />
                <span>Music</span>
              </Link>
              <Link 
                href="/about" 
                className="text-muted-foreground hover:text-qloo-teal transition-colors flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Film className="h-5 w-5" />
                <span>Movies</span>
              </Link>
              <Link 
                href="/about" 
                className="text-muted-foreground hover:text-qloo-teal transition-colors flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Book className="h-5 w-5" />
                <span>Books</span>
              </Link>
              <Link 
                href="/settings" 
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
              <div className="flex items-center justify-between pt-2 mt-2 border-t">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="rounded-full"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <div className="flex gap-2">
                  {isAuthenticated ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-qloo-teal text-foreground hover:bg-qloo-teal/10"
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  ) : (
                    <>
                      <Link href="/signin" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" size="sm" className="border-qloo-teal text-foreground hover:bg-qloo-teal/10">Sign In</Button>
                      </Link>
                      <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                        <Button size="sm" className="bg-qloo-yellow text-qloo-black hover:bg-qloo-yellow/90">Sign Up</Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
} 