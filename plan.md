AI-Powered Multi-Platform Intent Signal Detection SaaS
Complete 8-Week MVP Build Plan
Table of Contents
Executive Summary

Product Overview

Tech Stack

Database Setup

Project Structure

Week 1-2: Core Detection Engine

Week 2: Background Job System

Week 3: Contact Enrichment

Week 3-4: Frontend Dashboard

Week 4: Integration & Launch

Environment Setup

Deployment Guide

Go-to-Market Strategy

Success Metrics

Executive Summary
What We're Building: Multi-platform AI-powered intent signal detection SaaS that finds B2B buying signals across Reddit, LinkedIn, HackerNews, and Twitter/X.

Key Differentiators vs. Gojiberry:

🌐 Multi-platform (Reddit + LinkedIn + HN + Twitter) vs. LinkedIn-only

🤖 AI-powered qualification with GPT-4o scoring

✅ Zero LinkedIn automation = no ban risk

💰 Flat pricing ($129/month) vs. per-seat pricing

🎯 Higher intent signals (explicit asks on Reddit/HN vs. ambient LinkedIn activity)

Timeline: 8 weeks to launch MVP

Target: $10K MRR in 90 days (77 customers at $129/month)

Gross Margin: 96% (monthly costs ~$386)

Product Overview
Problem
Sales teams waste hours manually searching Reddit, LinkedIn, and HN for prospects showing buying intent. Tools like Gojiberry only monitor LinkedIn, missing high-intent conversations happening everywhere else.

Solution
Automated multi-platform monitoring that:

Finds prospects actively asking for solutions (not just browsing)

AI scores intent 1-10 to prioritize hot leads

Enriches contacts with email + LinkedIn in one click

Sends real-time alerts to Slack/email

No automation = accounts stay safe

Core User Workflow
User adds keyword: "ZoomInfo alternatives"

System monitors Reddit, LinkedIn, HN, Twitter 24/7

Someone posts "Looking for ZoomInfo alternative for SMBs under $500/month"

AI scores it 9/10 intent, extracts pain points

User gets Slack alert within 15 minutes

User clicks "Enrich" → gets name, email, company, title

User reaches out while lead is still hot

Tech Stack
Backend
Language: Python 3.11+

Framework: FastAPI

Database: PostgreSQL via Supabase (direct SQL, no ORM)

Database Driver: psycopg2

Background Jobs: Celery + Redis

AI: OpenAI API (GPT-4o-mini, GPT-4o, text-embedding-3-small)

Frontend
Framework: Next.js 14+ with TypeScript

Styling: Tailwind CSS + Shadcn/ui components

Data Fetching: TanStack Query (React Query)

Charts: Recharts (for analytics)

Infrastructure
Backend Hosting: Railway or Render

Frontend Hosting: Vercel

Database: Supabase (PostgreSQL + pgvector)

Cache/Queue: Redis (Upstash or Railway addon)

Third-Party APIs
Reddit: PRAW (Python Reddit API Wrapper)

LinkedIn: Bright Data Web Scraper API

HackerNews: Algolia HN Search API (free)

Twitter/X: Twitter API v2 Basic (free tier)

Email Finder: Hunter.io ($49/month for 1,000 searches)

Email Delivery: SendGrid or Resend

Payments: Stripe

Search: SerpAPI (for LinkedIn profile finding)

Database Setup
Step 1: Create Supabase Project
Go to supabase.com

Click "New Project"

Choose project name, database password, region

Wait 2 minutes for provisioning

Step 2: Run Schema
Go to SQL Editor in Supabase dashboard

Click "New Query"

Paste the schema below

Click "Run" (⌘ + Enter)

sql
-- Enable vector extension for semantic similarity
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table
CREATE TABLE users (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
email VARCHAR(255) UNIQUE NOT NULL,
password_hash VARCHAR(255) NOT NULL,
full_name VARCHAR(255),
company_name VARCHAR(255),
plan VARCHAR(50) DEFAULT 'trial',
enrichment_credits INT DEFAULT 250,
stripe_customer_id VARCHAR(255),
stripe_subscription_id VARCHAR(255),
trial_ends_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days',
created_at TIMESTAMP DEFAULT NOW(),
last_login_at TIMESTAMP
);

-- Keyword monitors (searches users create)
CREATE TABLE keyword_monitors (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID REFERENCES users(id) ON DELETE CASCADE,
keyword TEXT NOT NULL,
platforms JSONB DEFAULT '["reddit", "linkedin", "hn", "twitter"]',
min_intent_score INT DEFAULT 7,
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMP DEFAULT NOW(),
last_scanned_at TIMESTAMP
);

-- Detected signals (buying intent findings)
CREATE TABLE signals (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
monitor_id UUID REFERENCES keyword_monitors(id) ON DELETE CASCADE,
user_id UUID REFERENCES users(id) ON DELETE CASCADE,

-- Raw signal data
platform VARCHAR(50) NOT NULL,
content TEXT NOT NULL,
source_url TEXT NOT NULL UNIQUE,
author_username VARCHAR(255),
author_profile_url TEXT,
detected_at TIMESTAMP DEFAULT NOW(),

-- AI analysis results
intent_score INT,
urgency VARCHAR(20),
budget_signals BOOLEAN,
pain_points TEXT[],
decision_stage VARCHAR(50),
competitors_mentioned TEXT[],
is_qualified BOOLEAN,
ai_reasoning TEXT,
one_line_summary TEXT,

-- User actions
is_contacted BOOLEAN DEFAULT false,
is_archived BOOLEAN DEFAULT false,

-- Vector for semantic similarity
embedding VECTOR(1536),

created_at TIMESTAMP DEFAULT NOW()
);

-- Enriched contact data
CREATE TABLE enriched_contacts (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
signal_id UUID REFERENCES signals(id) ON DELETE CASCADE,
user_id UUID REFERENCES users(id) ON DELETE CASCADE,

full_name VARCHAR(255),
email VARCHAR(255),
email_confidence VARCHAR(20), -- verified, likely, guessed
company VARCHAR(255),
job_title VARCHAR(255),
linkedin_url TEXT,
company_size VARCHAR(50),
industry VARCHAR(100),

enrichment_source VARCHAR(50), -- hunter, prospeo, pattern
enriched_at TIMESTAMP DEFAULT NOW()
);

-- Alert settings per user
CREATE TABLE alert_settings (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,

email_enabled BOOLEAN DEFAULT true,
email_frequency VARCHAR(50) DEFAULT 'realtime',

slack_enabled BOOLEAN DEFAULT false,
slack_webhook_url TEXT,

min_intent_score INT DEFAULT 7,

created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

-- User company info (for AI outreach generation)
CREATE TABLE user_company_info (
user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
company_name VARCHAR(255),
value_proposition TEXT,
target_customer TEXT,
updated_at TIMESTAMP DEFAULT NOW()
);

-- Usage tracking for analytics
CREATE TABLE usage_logs (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID REFERENCES users(id) ON DELETE CASCADE,
action VARCHAR(100), -- signal_detected, contact_enriched, alert_sent
metadata JSONB,
created_at TIMESTAMP DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_signals_user_id ON signals(user_id);
CREATE INDEX idx_signals_detected_at ON signals(detected_at DESC);
CREATE INDEX idx_signals_intent_score ON signals(intent_score DESC);
CREATE INDEX idx_signals_platform ON signals(platform);
CREATE INDEX idx_signals_source_url ON signals(source_url);
CREATE INDEX idx_monitors_user_active ON keyword_monitors(user_id, is_active);
CREATE INDEX idx_usage_logs_user_action ON usage_logs(user_id, action);

-- Vector similarity index (IVFFlat for fast nearest neighbor search)
CREATE INDEX idx_signals_embedding ON signals USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Row Level Security (optional, for Supabase auth)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE enriched_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_settings ENABLE ROW LEVEL SECURITY;

-- Policies (users can only see their own data)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own monitors" ON keyword_monitors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own monitors" ON keyword_monitors FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own signals" ON signals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own signals" ON signals FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own enriched contacts" ON enriched_contacts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own alert settings" ON alert_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own alert settings" ON alert_settings FOR ALL USING (auth.uid() = user_id);
Step 3: Get Connection Details
Go to Project Settings → Database

Copy:

DATABASE_URL (Connection string)

SUPABASE_URL (https://xxx.supabase.co)

SUPABASE_ANON_KEY (public API key)

Project Structure
text
intent-signals-saas/
├── backend/
│ ├── main.py # FastAPI app entry
│ ├── celery_app.py # Celery config
│ ├── requirements.txt
│ ├── .env
│ │
│ ├── database/
│ │ └── db.py # All SQL queries (no ORM)
│ │
│ ├── scrapers/
│ │ ├── **init**.py
│ │ ├── reddit_scraper.py
│ │ ├── linkedin_scraper.py
│ │ ├── hn_scraper.py
│ │ └── twitter_scraper.py
│ │
│ ├── ai/
│ │ ├── **init**.py
│ │ └── intent_analyzer.py # OpenAI intent scoring
│ │
│ ├── enrichment/
│ │ ├── **init**.py
│ │ └── enrichment_service.py # Email finding
│ │
│ ├── tasks/
│ │ ├── **init**.py
│ │ ├── monitor_tasks.py # Background scanning
│ │ └── alert_tasks.py # Notifications
│ │
│ ├── routes/
│ │ ├── **init**.py
│ │ ├── auth.py
│ │ ├── signals.py
│ │ ├── monitors.py
│ │ └── enrichment.py
│ │
│ └── utils/
│ ├── **init**.py
│ ├── auth.py # JWT auth
│ └── notifications.py # Email/Slack
│
├── frontend/
│ ├── package.json
│ ├── next.config.js
│ ├── tailwind.config.js
│ ├── .env.local
│ │
│ ├── app/
│ │ ├── layout.tsx
│ │ ├── page.tsx # Landing page
│ │ ├── dashboard/
│ │ │ └── page.tsx # Main dashboard
│ │ ├── login/
│ │ │ └── page.tsx
│ │ └── signup/
│ │ └── page.tsx
│ │
│ ├── components/
│ │ ├── ui/ # Shadcn components
│ │ ├── signal-card.tsx
│ │ ├── keyword-manager.tsx
│ │ ├── stat-card.tsx
│ │ └── navbar.tsx
│ │
│ └── lib/
│ ├── api.ts # API client
│ └── utils.ts
│
└── README.md
Week 1-2: Core Detection Engine
Day 1-2: Database Module
File: backend/database/db.py

python
"""
Direct SQL database operations using psycopg2.
No ORM overhead - fast and simple.
"""

import psycopg2
from psycopg2.extras import RealDictCursor, Json
from typing import Optional, List, Dict, Any
import os

def get_db_connection():
"""Get PostgreSQL connection with dict cursor"""
return psycopg2.connect(
os.getenv("DATABASE_URL"),
cursor_factory=RealDictCursor
)

class Database:
"""Database operations using direct SQL queries"""

    # ==================== MONITORS ====================

    def get_active_monitors(self) -> List[Dict]:
        """Get all active keyword monitors across all users"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT * FROM keyword_monitors
                    WHERE is_active = true
                    ORDER BY last_scanned_at ASC NULLS FIRST
                """)
                return cur.fetchall()

    def get_user_monitors(self, user_id: str) -> List[Dict]:
        """Get all monitors for a specific user"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT * FROM keyword_monitors
                    WHERE user_id = %s
                    ORDER BY created_at DESC
                """, (user_id,))
                return cur.fetchall()

    def get_monitor(self, monitor_id: str) -> Optional[Dict]:
        """Get single monitor by ID"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT * FROM keyword_monitors WHERE id = %s",
                    (monitor_id,)
                )
                return cur.fetchone()

    def create_monitor(self, user_id: str, keyword: str,
                       platforms: List[str], min_intent_score: int = 7) -> str:
        """Create new keyword monitor"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO keyword_monitors
                    (user_id, keyword, platforms, min_intent_score)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id
                """, (user_id, keyword, Json(platforms), min_intent_score))

                monitor_id = cur.fetchone()['id']
                conn.commit()
                return monitor_id

    def delete_monitor(self, monitor_id: str, user_id: str) -> bool:
        """Delete monitor (ensures user owns it)"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    DELETE FROM keyword_monitors
                    WHERE id = %s AND user_id = %s
                    RETURNING id
                """, (monitor_id, user_id))

                deleted = cur.fetchone() is not None
                conn.commit()
                return deleted

    def update_monitor_scan_time(self, monitor_id: str):
        """Update last scanned timestamp"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE keyword_monitors
                    SET last_scanned_at = NOW()
                    WHERE id = %s
                """, (monitor_id,))
                conn.commit()

    # ==================== SIGNALS ====================

    def signal_exists(self, source_url: str) -> bool:
        """Check if signal already exists (prevent duplicates)"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT EXISTS(SELECT 1 FROM signals WHERE source_url = %s)",
                    (source_url,)
                )
                return cur.fetchone()['exists']

    def create_signal(self, monitor_id: str, user_id: str,
                     signal_data: Dict, ai_analysis: Dict,
                     embedding: List[float]) -> str:
        """Create new signal with AI analysis"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO signals (
                        monitor_id, user_id, platform, content, source_url,
                        author_username, author_profile_url, detected_at,
                        intent_score, urgency, budget_signals, pain_points,
                        decision_stage, competitors_mentioned, is_qualified,
                        ai_reasoning, one_line_summary, embedding
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    )
                    RETURNING id
                """, (
                    monitor_id,
                    user_id,
                    signal_data['platform'],
                    signal_data['content'],
                    signal_data['source_url'],
                    signal_data.get('author_username'),
                    signal_data.get('author_profile_url'),
                    signal_data.get('detected_at'),
                    ai_analysis['intent_score'],
                    ai_analysis['urgency'],
                    ai_analysis['budget_signals'],
                    ai_analysis['pain_points'],
                    ai_analysis['decision_stage'],
                    ai_analysis['competitors_mentioned'],
                    ai_analysis['is_qualified'],
                    ai_analysis['ai_reasoning'],
                    ai_analysis['one_line_summary'],
                    embedding
                ))

                signal_id = cur.fetchone()['id']
                conn.commit()
                return signal_id

    def get_user_signals(self, user_id: str, limit: int = 50,
                        platform: Optional[str] = None,
                        min_score: int = 0) -> List[Dict]:
        """Get user's signals with optional filters"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                query = """
                    SELECT
                        s.*,
                        e.full_name, e.email, e.email_confidence,
                        e.company, e.job_title, e.linkedin_url,
                        e.id as enriched_contact_id
                    FROM signals s
                    LEFT JOIN enriched_contacts e ON s.id = e.signal_id
                    WHERE s.user_id = %s
                      AND s.is_archived = false
                      AND s.intent_score >= %s
                """
                params = [user_id, min_score]

                if platform:
                    query += " AND s.platform = %s"
                    params.append(platform)

                query += " ORDER BY s.detected_at DESC LIMIT %s"
                params.append(limit)

                cur.execute(query, params)
                return cur.fetchall()

    def get_signal(self, signal_id: str) -> Optional[Dict]:
        """Get single signal"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM signals WHERE id = %s", (signal_id,))
                return cur.fetchone()

    def get_signal_with_details(self, signal_id: str) -> Optional[Dict]:
        """Get signal with enriched contact data"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT s.*,
                           e.full_name, e.email, e.company, e.job_title,
                           e.linkedin_url, e.email_confidence
                    FROM signals s
                    LEFT JOIN enriched_contacts e ON s.id = e.signal_id
                    WHERE s.id = %s
                """, (signal_id,))
                return cur.fetchone()

    def find_similar_signals(self, user_id: str, embedding: List[float],
                           threshold: float = 0.9, days: int = 7) -> List[Dict]:
        """Find semantically similar signals using vector similarity"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT
                        id,
                        content,
                        source_url,
                        1 - (embedding <=> %s::vector) as similarity
                    FROM signals
                    WHERE user_id = %s
                      AND detected_at > NOW() - INTERVAL '%s days'
                      AND embedding IS NOT NULL
                    ORDER BY embedding <=> %s::vector
                    LIMIT 5
                """, (embedding, user_id, days, embedding))

                results = cur.fetchall()
                return [r for r in results if r['similarity'] >= threshold]

    def mark_signal_contacted(self, signal_id: str, user_id: str):
        """Mark signal as contacted"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE signals
                    SET is_contacted = true
                    WHERE id = %s AND user_id = %s
                """, (signal_id, user_id))
                conn.commit()

    def archive_signal(self, signal_id: str, user_id: str):
        """Archive signal"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE signals
                    SET is_archived = true
                    WHERE id = %s AND user_id = %s
                """, (signal_id, user_id))
                conn.commit()

    # ==================== ENRICHMENT ====================

    def create_enriched_contact(self, data: Dict) -> str:
        """Create enriched contact"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO enriched_contacts (
                        signal_id, user_id, full_name, email, email_confidence,
                        company, job_title, linkedin_url, company_size, industry,
                        enrichment_source
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, (
                    data['signal_id'],
                    data['user_id'],
                    data.get('full_name'),
                    data.get('email'),
                    data.get('email_confidence'),
                    data.get('company'),
                    data.get('job_title'),
                    data.get('linkedin_url'),
                    data.get('company_size'),
                    data.get('industry'),
                    data.get('enrichment_source')
                ))

                contact_id = cur.fetchone()['id']
                conn.commit()
                return contact_id

    def get_enriched_contact_by_signal(self, signal_id: str) -> Optional[Dict]:
        """Get enriched contact for a signal"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT * FROM enriched_contacts WHERE signal_id = %s",
                    (signal_id,)
                )
                return cur.fetchone()

    # ==================== USERS ====================

    def create_user(self, email: str, password_hash: str,
                   full_name: str = None) -> str:
        """Create new user"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO users (email, password_hash, full_name)
                    VALUES (%s, %s, %s)
                    RETURNING id
                """, (email, password_hash, full_name))

                user_id = cur.fetchone()['id']
                conn.commit()

                # Create default alert settings
                self.create_default_alert_settings(user_id)

                return user_id

    def get_user(self, user_id: str) -> Optional[Dict]:
        """Get user by ID"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
                return cur.fetchone()

    def get_user_by_email(self, email: str) -> Optional[Dict]:
        """Get user by email"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM users WHERE email = %s", (email,))
                return cur.fetchone()

    def update_last_login(self, user_id: str):
        """Update last login timestamp"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE users
                    SET last_login_at = NOW()
                    WHERE id = %s
                """, (user_id,))
                conn.commit()

    def decrement_credits(self, user_id: str, amount: int = 1):
        """Decrement user's enrichment credits"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE users
                    SET enrichment_credits = GREATEST(enrichment_credits - %s, 0)
                    WHERE id = %s
                    RETURNING enrichment_credits
                """, (amount, user_id))

                result = cur.fetchone()
                conn.commit()
                return result['enrichment_credits'] if result else 0

    def add_credits(self, user_id: str, amount: int):
        """Add enrichment credits"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE users
                    SET enrichment_credits = enrichment_credits + %s
                    WHERE id = %s
                """, (amount, user_id))
                conn.commit()

    # ==================== ALERT SETTINGS ====================

    def create_default_alert_settings(self, user_id: str):
        """Create default alert settings for new user"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO alert_settings (user_id)
                    VALUES (%s)
                    ON CONFLICT (user_id) DO NOTHING
                """, (user_id,))
                conn.commit()

    def get_alert_settings(self, user_id: str) -> Dict:
        """Get user's alert settings"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT * FROM alert_settings WHERE user_id = %s",
                    (user_id,)
                )

                settings = cur.fetchone()

                # Return defaults if not found
                if not settings:
                    return {
                        'email_enabled': True,
                        'email_frequency': 'realtime',
                        'slack_enabled': False,
                        'slack_webhook_url': None,
                        'min_intent_score': 7
                    }

                return settings

    def update_alert_settings(self, user_id: str, settings: Dict):
        """Update alert settings"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE alert_settings
                    SET
                        email_enabled = COALESCE(%s, email_enabled),
                        email_frequency = COALESCE(%s, email_frequency),
                        slack_enabled = COALESCE(%s, slack_enabled),
                        slack_webhook_url = COALESCE(%s, slack_webhook_url),
                        min_intent_score = COALESCE(%s, min_intent_score),
                        updated_at = NOW()
                    WHERE user_id = %s
                """, (
                    settings.get('email_enabled'),
                    settings.get('email_frequency'),
                    settings.get('slack_enabled'),
                    settings.get('slack_webhook_url'),
                    settings.get('min_intent_score'),
                    user_id
                ))
                conn.commit()

    # ==================== STATS ====================

    def count_signals(self, user_id: str, days: int = 1) -> int:
        """Count signals in last N days"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT COUNT(*) as count
                    FROM signals
                    WHERE user_id = %s
                      AND detected_at > NOW() - INTERVAL '%s days'
                """, (user_id, days))

                return cur.fetchone()['count']

    def get_dashboard_stats(self, user_id: str) -> Dict:
        """Get all dashboard stats in one query (efficient)"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT
                        COUNT(*) FILTER (
                            WHERE detected_at > NOW() - INTERVAL '1 day'
                        ) as today,
                        COUNT(*) FILTER (
                            WHERE detected_at > NOW() - INTERVAL '7 days'
                        ) as week,
                        COUNT(*) FILTER (
                            WHERE intent_score >= 8
                        ) as high_intent,
                        COUNT(*) FILTER (
                            WHERE EXISTS (
                                SELECT 1 FROM enriched_contacts e
                                WHERE e.signal_id = signals.id
                            )
                        ) as enriched_count
                    FROM signals
                    WHERE user_id = %s AND is_archived = false
                """, (user_id,))

                stats = cur.fetchone()

                # Get user credits
                cur.execute(
                    "SELECT enrichment_credits FROM users WHERE id = %s",
                    (user_id,)
                )
                user = cur.fetchone()

                return {
                    'today': stats['today'],
                    'week': stats['week'],
                    'high_intent': stats['high_intent'],
                    'enriched_count': stats['enriched_count'],
                    'credits': user['enrichment_credits'] if user else 0
                }

    # ==================== USAGE LOGS ====================

    def log_usage(self, user_id: str, action: str, metadata: Dict = None):
        """Log user action for analytics"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO usage_logs (user_id, action, metadata)
                    VALUES (%s, %s, %s)
                """, (user_id, action, Json(metadata or {})))
                conn.commit()

    def get_usage_stats(self, user_id: str, days: int = 30) -> Dict:
        """Get usage statistics for user"""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT
                        action,
                        COUNT(*) as count
                    FROM usage_logs
                    WHERE user_id = %s
                      AND created_at > NOW() - INTERVAL '%s days'
                    GROUP BY action
                """, (user_id, days))

                return {row['action']: row['count'] for row in cur.fetchall()}

# Global database instance

db = Database()
Day 3-5: Platform Scrapers
File: backend/scrapers/reddit_scraper.py

python
"""
Reddit scraper using PRAW (Python Reddit API Wrapper)
"""

import praw
from datetime import datetime, timedelta
from typing import List, Dict
import os

class RedditScraper:
def **init**(self):
self.reddit = praw.Reddit(
client_id=os.getenv('REDDIT_CLIENT_ID'),
client_secret=os.getenv('REDDIT_CLIENT_SECRET'),
user_agent='IntentSignalBot/1.0 by YourUsername'
)

    def search_signals(self, keyword: str, hours_back: int = 24,
                       limit: int = 100) -> List[Dict]:
        """
        Search Reddit for posts/comments matching keyword
        Returns list of potential buying signals
        """
        signals = []
        time_threshold = datetime.utcnow() - timedelta(hours=hours_back)

        try:
            # Search submissions (posts)
            for submission in self.reddit.subreddit('all').search(
                keyword,
                time_filter='day',  # Reddit's time filter
                limit=limit,
                sort='new'
            ):
                created_time = datetime.fromtimestamp(submission.created_utc)

                # Skip old posts
                if created_time < time_threshold:
                    continue

                # Get top comments for context
                submission.comments.replace_more(limit=0)
                top_comments = []
                for comment in submission.comments[:5]:
                    top_comments.append(comment.body)

                full_content = f"{submission.title}\n\n{submission.selftext}"

                # Skip if too short (likely spam/low quality)
                if len(full_content.strip()) < 30:
                    continue

                signals.append({
                    'platform': 'reddit',
                    'content': full_content,
                    'source_url': f"https://reddit.com{submission.permalink}",
                    'author_username': str(submission.author) if submission.author else '[deleted]',
                    'author_profile_url': f"https://reddit.com/u/{submission.author}" if submission.author else None,
                    'detected_at': created_time,
                    'comments_sample': top_comments  # For AI context
                })

            return signals

        except Exception as e:
            print(f"Reddit scraping error: {e}")
            return []

File: backend/scrapers/linkedin_scraper.py

python
"""
LinkedIn scraper using Bright Data API
"""

import requests
from datetime import datetime
from typing import List, Dict
import os
import time

class LinkedInScraper:
def **init**(self):
self.api_key = os.getenv('BRIGHTDATA_API_KEY')
self.base_url = "https://api.brightdata.com/datasets/v3"

    def search_signals(self, keyword: str, hours_back: int = 24) -> List[Dict]:
        """
        Search LinkedIn posts for buying signals
        Uses Bright Data's LinkedIn Posts dataset
        """
        try:
            # Trigger scraping job
            payload = {
                "dataset_id": "gd_l7q7dkf244hwjntr0",  # LinkedIn posts dataset
                "discover_by": [{
                    "type": "keyword_search",
                    "keyword": keyword,
                    "time_filter": "past-24h"
                }],
                "limit": 100
            }

            response = requests.post(
                f"{self.base_url}/trigger",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json=payload
            )

            if response.status_code != 200:
                print(f"LinkedIn API error: {response.text}")
                return []

            snapshot_id = response.json()['snapshot_id']

            # Wait for results (poll every 5 seconds for max 2 minutes)
            results = self._wait_for_results(snapshot_id, max_wait=120)

            signals = []
            for post in results:
                # Parse datetime
                try:
                    detected_at = datetime.fromisoformat(post['posted_date'].replace('Z', '+00:00'))
                except:
                    detected_at = datetime.utcnow()

                signals.append({
                    'platform': 'linkedin',
                    'content': post.get('text', ''),
                    'source_url': post.get('url', ''),
                    'author_username': post.get('author_name', 'Unknown'),
                    'author_profile_url': post.get('author_profile_url', ''),
                    'detected_at': detected_at
                })

            return signals

        except Exception as e:
            print(f"LinkedIn scraping error: {e}")
            return []

    def _wait_for_results(self, snapshot_id: str, max_wait: int = 120) -> List[Dict]:
        """Poll Bright Data for completed results"""
        start_time = time.time()

        while time.time() - start_time < max_wait:
            response = requests.get(
                f"{self.base_url}/snapshot/{snapshot_id}",
                headers={"Authorization": f"Bearer {self.api_key}"}
            )

            if response.status_code != 200:
                return []

            data = response.json()

            if data['status'] == 'ready':
                return data.get('data', [])
            elif data['status'] == 'failed':
                print(f"Bright Data job failed: {data.get('error')}")
                return []

            time.sleep(5)

        print(f"Bright Data timeout after {max_wait}s")
        return []

File: backend/scrapers/hn_scraper.py

python
"""
HackerNews scraper using Algolia Search API (free)
"""

import requests
from datetime import datetime
from typing import List, Dict
import time as time_module

class HNScraper:
def **init**(self):
self.algolia_url = "https://hn.algolia.com/api/v1"

    def search_signals(self, keyword: str, hours_back: int = 24) -> List[Dict]:
        """
        Search HN using Algolia API
        Focus on comments where people ask questions/seek recommendations
        """
        time_threshold = int(time_module.time()) - (hours_back * 3600)
        signals = []

        try:
            # Search comments (where buying intent lives)
            params = {
                'query': keyword,
                'tags': 'comment',
                'numericFilters': f'created_at_i>{time_threshold}',
                'hitsPerPage': 100
            }

            response = requests.get(
                f"{self.algolia_url}/search_by_date",
                params=params
            )

            if response.status_code != 200:
                return []

            data = response.json()

            for hit in data.get('hits', []):
                comment_text = hit.get('comment_text', '')

                # Skip very short comments
                if len(comment_text.strip()) < 30:
                    continue

                signals.append({
                    'platform': 'hackernews',
                    'content': comment_text,
                    'source_url': f"https://news.ycombinator.com/item?id={hit['objectID']}",
                    'author_username': hit.get('author', 'unknown'),
                    'author_profile_url': f"https://news.ycombinator.com/user?id={hit.get('author', '')}",
                    'detected_at': datetime.fromtimestamp(hit['created_at_i'])
                })

            return signals

        except Exception as e:
            print(f"HN scraping error: {e}")
            return []

File: backend/scrapers/twitter_scraper.py

python
"""
Twitter/X scraper using Twitter API v2
"""

import tweepy
from datetime import datetime, timedelta
from typing import List, Dict
import os

class TwitterScraper:
def **init**(self):
bearer_token = os.getenv('TWITTER_BEARER_TOKEN')
self.client = tweepy.Client(bearer_token=bearer_token)

    def search_signals(self, keyword: str, hours_back: int = 24) -> List[Dict]:
        """
        Search Twitter/X for buying signals
        Uses Twitter API v2 recent search
        """
        start_time = datetime.utcnow() - timedelta(hours=hours_back)
        signals = []

        try:
            # Search tweets (exclude retweets and replies for quality)
            tweets = self.client.search_recent_tweets(
                query=f"{keyword} -is:retweet -is:reply lang:en",
                start_time=start_time,
                max_results=100,
                tweet_fields=['created_at', 'author_id', 'public_metrics'],
                user_fields=['username', 'name'],
                expansions=['author_id']
            )

            if not tweets.data:
                return []

            # Build user lookup dict
            users = {user.id: user for user in tweets.includes.get('users', [])}

            for tweet in tweets.data:
                author = users.get(tweet.author_id)

                # Skip very short tweets
                if len(tweet.text.strip()) < 30:
                    continue

                signals.append({
                    'platform': 'twitter',
                    'content': tweet.text,
                    'source_url': f"https://twitter.com/i/web/status/{tweet.id}",
                    'author_username': author.username if author else 'unknown',
                    'author_profile_url': f"https://twitter.com/{author.username}" if author else None,
                    'detected_at': tweet.created_at
                })

            return signals

        except Exception as e:
            print(f"Twitter scraping error: {e}")
            return []

File: backend/scrapers/**init**.py

python
from .reddit_scraper import RedditScraper
from .linkedin_scraper import LinkedInScraper
from .hn_scraper import HNScraper
from .twitter_scraper import TwitterScraper

**all** = ['RedditScraper', 'LinkedInScraper', 'HNScraper', 'TwitterScraper']
Day 6-8: AI Intent Analyzer
File: backend/ai/intent_analyzer.py

python
"""
AI-powered intent analysis using OpenAI GPT-4o-mini
Scores signals, extracts pain points, and generates summaries
"""

from openai import OpenAI
import json
from typing import Dict, List
import os

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def analyze_intent(signal: Dict, comments_sample: List[str] = None) -> Dict:
"""
Use GPT-4o-mini to deeply analyze buying intent

    Returns:
        {
            'intent_score': int (1-10),
            'urgency': 'low' | 'medium' | 'high',
            'budget_signals': bool,
            'pain_points': List[str],
            'decision_stage': 'awareness' | 'consideration' | 'decision',
            'competitors_mentioned': List[str],
            'is_qualified': bool,
            'ai_reasoning': str,
            'one_line_summary': str
        }
    """

    # Build context
    context = signal['content'][:1500]  # Limit for token costs

    if comments_sample:
        context += "\n\n[Top Comments]:\n" + "\n---\n".join(comments_sample[:3])

    prompt = f"""Analyze this {signal['platform']} post for B2B buying intent.

POST CONTENT:
"{context}"

Provide a JSON response with:

1. intent_score (1-10): How likely is this person actively shopping for a B2B solution RIGHT NOW?
2. urgency (low/medium/high): How urgent is their need?
3. budget_signals (true/false): Any mentions of budget, pricing, or willingness to pay?
4. pain_points (array of strings): List 2-3 specific problems they're experiencing
5. decision_stage (awareness/consideration/decision): Where in buying journey?
6. competitors_mentioned (array of strings): List any competitor products/tools mentioned
7. is_qualified (true/false): Is this a real B2B buying signal worth pursuing?
8. ai_reasoning (string): Brief 1-sentence explanation of the score
9. one_line_summary (string): Summarize what this person needs in under 12 words

SCORING GUIDE:

- 9-10: Explicit "looking for", "need alternatives", mentions budget/timeline, comparing options NOW
- 7-8: Clear problem statement, asking for recommendations, frustrated with current solution
- 5-6: Problem awareness, seeking advice, exploratory
- 3-4: General discussion, hypothetical, low urgency
- 1-2: Not relevant, spam, or off-topic

QUALIFICATION RULES:

- Only mark is_qualified=true if intent_score >= 6 AND this is a genuine B2B buying signal
- If it's a joke, sarcasm, or off-topic, mark is_qualified=false even if keywords match

EXAMPLES:
"Looking for ZoomInfo alternatives under $500/month for our 10-person sales team"
→ score: 10, urgency: high, qualified: true

"I tried Apollo but the data is terrible. Anyone know something better?"
→ score: 9, urgency: high, qualified: true

"What CRMs are people using these days? Just curious"
→ score: 5, urgency: low, qualified: true (but low priority)

"Apollo astronauts landed on the moon"
→ score: 1, urgency: low, qualified: false
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Cheap + fast
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.3,  # Lower = more consistent
            max_tokens=500
        )

        analysis = json.loads(response.choices[0].message.content)

        # Validate structure
        required_fields = [
            'intent_score', 'urgency', 'budget_signals', 'pain_points',
            'decision_stage', 'competitors_mentioned', 'is_qualified',
            'ai_reasoning', 'one_line_summary'
        ]

        for field in required_fields:
            if field not in analysis:
                raise ValueError(f"Missing field: {field}")

        return analysis

    except Exception as e:
        print(f"AI analysis failed: {e}")

        # Return safe defaults on error
        return {
            'intent_score': 5,
            'urgency': 'medium',
            'budget_signals': False,
            'pain_points': [],
            'decision_stage': 'unknown',
            'competitors_mentioned': [],
            'is_qualified': False,
            'ai_reasoning': f'Analysis failed: {str(e)}',
            'one_line_summary': signal['content'][:60]
        }

def get_embedding(text: str) -> List[float]:
"""
Generate embedding for duplicate detection
Uses text-embedding-3-small (cheap + effective)
"""
try:
response = client.embeddings.create(
model="text-embedding-3-small",
input=text[:8000] # Token limit
)
return response.data[0].embedding

    except Exception as e:
        print(f"Embedding generation failed: {e}")
        return [0.0] * 1536  # Return zero vector on error

def generate_outreach_message(signal: Dict, enriched_contact: Dict,
user_company_info: Dict) -> str:
"""
Generate personalized outreach message using GPT-4o

    Args:
        signal: Signal data with AI analysis
        enriched_contact: Enriched contact data
        user_company_info: User's company info for context

    Returns:
        str: Personalized outreach message draft
    """
    prompt = f"""You're helping a B2B sales rep reach out to a warm lead who showed buying intent.

LEAD CONTEXT:

- Name: {enriched_contact.get('full_name', 'there')}
- Company: {enriched_contact.get('company', 'Unknown')}
- Title: {enriched_contact.get('job_title', 'Unknown')}
- Platform: {signal['platform']}
- Their post: "{signal['content'][:300]}"
- Pain points: {', '.join(signal.get('pain_points', []))}
- Intent score: {signal.get('intent_score', 5)}/10

YOUR COMPANY:

- Name: {user_company_info.get('company_name', 'Your Company')}
- Value prop: {user_company_info.get('value_proposition', 'We solve your problems')}

Write a 3-4 sentence outreach message that:

1. References their specific post (WITHOUT being creepy or saying "I saw your post")
2. Offers genuine help, not a sales pitch
3. Suggests a specific next step (15-min call, send resource, etc.)
4. Matches {signal['platform']} culture (Reddit = casual, LinkedIn = professional)

TONE: Helpful peer, not salesperson. Make it feel like a friend reaching out.

BAD (too salesy): "Hi! I saw your post about X. We have the perfect solution..."
GOOD: "Hey! I've helped a few teams solve [their pain point]. Happy to share what worked..."

Output ONLY the message, no subject line or extra text.
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",  # Better for creative writing
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=300
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"Outreach generation failed: {e}")
        return f"Hi {enriched_contact.get('full_name', 'there')},\n\nI saw you were looking for help with {signal.get('pain_points', ['this problem'])[0]}. We've helped similar companies solve this. Would you be open to a quick chat?"

Week 2: Background Job System
Celery Configuration
File: backend/celery_app.py

python
"""
Celery configuration for background task processing
"""

from celery import Celery
from celery.schedules import crontab
import os

celery_app = Celery(
'intent_signals',
broker=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
backend=os.getenv('REDIS_URL', 'redis://localhost:6379/0')
)

celery_app.conf.update(
task_serializer='json',
accept_content=['json'],
result_serializer='json',
timezone='UTC',
enable_utc=True,
task_track_started=True,
task_time_limit=300, # 5 minutes max per task
worker_prefetch_multiplier=1,
worker_max_tasks_per_child=1000,
)

# Periodic task schedule

celery_app.conf.beat_schedule = { # Scan all monitors every 15 minutes
'scan-all-monitors': {
'task': 'tasks.monitor_tasks.scan_all_monitors',
'schedule': crontab(minute='\*/15'),
},

    # Send daily digest emails
    'send-daily-digests': {
        'task': 'tasks.alert_tasks.send_daily_digests',
        'schedule': crontab(hour=8, minute=0),  # 8 AM UTC
    },

    # Cleanup old signals (archive after 90 days)
    'cleanup-old-signals': {
        'task': 'tasks.cleanup_tasks.archive_old_signals',
        'schedule': crontab(hour=2, minute=0),  # 2 AM daily
    },

}
Monitor Scanning Tasks
File: backend/tasks/monitor_tasks.py

python
"""
Background tasks for scanning keyword monitors
"""

from celery_app import celery_app
from scrapers import RedditScraper, LinkedInScraper, HNScraper, TwitterScraper
from ai.intent_analyzer import analyze_intent, get_embedding
from database.db import db
from tasks.alert_tasks import send_alert
import os

# Initialize scrapers (reused across tasks)

scrapers = {
'reddit': RedditScraper(),
'linkedin': LinkedInScraper(),
'hackernews': HNScraper(),
'twitter': TwitterScraper()
}

@celery_app.task(name='tasks.monitor_tasks.scan_all_monitors')
def scan_all_monitors():
"""
Main orchestrator: Get all active monitors and queue scan tasks
Runs every 15 minutes via Celery Beat
"""
monitors = db.get_active_monitors()

    print(f"Found {len(monitors)} active monitors to scan")

    for monitor in monitors:
        # Queue individual monitor scan (runs in parallel)
        scan_single_monitor.delay(monitor['id'])

    return f"Queued {len(monitors)} monitor scans"

@celery_app.task(
name='tasks.monitor_tasks.scan_single_monitor',
bind=True,
max_retries=3,
default_retry_delay=60
)
def scan_single_monitor(self, monitor_id: str):
"""
Scan one keyword monitor across its enabled platforms

    Args:
        monitor_id: UUID of monitor to scan

    Returns:
        str: Summary of results
    """
    try:
        monitor = db.get_monitor(monitor_id)

        if not monitor or not monitor['is_active']:
            return "Monitor not found or inactive"

        keyword = monitor['keyword']
        enabled_platforms = monitor['platforms']
        user_id = monitor['user_id']

        print(f"Scanning monitor '{keyword}' on platforms: {enabled_platforms}")

        all_signals = []

        # Scan each enabled platform
        for platform in enabled_platforms:
            try:
                scraper = scrapers.get(platform)

                if not scraper:
                    print(f"No scraper for platform: {platform}")
                    continue

                signals = scraper.search_signals(keyword, hours_back=24)
                print(f"Found {len(signals)} signals on {platform}")

                all_signals.extend(signals)

            except Exception as e:
                print(f"Error scraping {platform}: {e}")
                continue

        # Process each signal (spawn parallel tasks for AI analysis)
        for signal in all_signals:
            process_signal.delay(monitor_id, user_id, signal)

        # Update last scanned timestamp
        db.update_monitor_scan_time(monitor_id)

        return f"Found {len(all_signals)} signals for '{keyword}'"

    except Exception as exc:
        print(f"Monitor scan failed: {exc}")
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))

@celery_app.task(name='tasks.monitor_tasks.process_signal')
def process_signal(monitor_id: str, user_id: str, signal_data: dict):
"""
Process single signal: AI analysis, dedup, save, alert

    Pipeline:
    1. Check for exact duplicate (URL)
    2. AI intent analysis
    3. Check qualification threshold
    4. Check for semantic duplicate (embedding)
    5. Save to database
    6. Send alert if qualified
    """

    # Step 1: Check exact duplicate
    if db.signal_exists(signal_data['source_url']):
        return "Duplicate URL, skipped"

    # Step 2: AI intent analysis
    try:
        ai_analysis = analyze_intent(
            signal_data,
            comments_sample=signal_data.get('comments_sample')
        )
    except Exception as e:
        print(f"AI analysis failed: {e}")
        return "AI analysis failed"

    # Step 3: Check if qualified
    if not ai_analysis['is_qualified']:
        return f"Not qualified (reason: {ai_analysis['ai_reasoning']})"

    # Step 4: Check against user's minimum intent score
    monitor = db.get_monitor(monitor_id)
    min_score = monitor.get('min_intent_score', 7)

    if ai_analysis['intent_score'] < min_score:
        return f"Intent score {ai_analysis['intent_score']} below threshold {min_score}"

    # Step 5: Generate embedding and check semantic duplicates
    try:
        embedding = get_embedding(signal_data['content'])

        similar_signals = db.find_similar_signals(
            user_id,
            embedding,
            threshold=0.92,  # 92% similarity = likely duplicate
            days=7
        )

        if similar_signals:
            print(f"Semantic duplicate detected: {similar_signals[0]['source_url']}")
            return "Semantic duplicate, skipped"

    except Exception as e:
        print(f"Embedding generation failed: {e}")
        embedding = None

    # Step 6: Save signal
    try:
        signal_id = db.create_signal(
            monitor_id=monitor_id,
            user_id=user_id,
            signal_data=signal_data,
            ai_analysis=ai_analysis,
            embedding=embedding
        )

        print(f"Created signal {signal_id} (score: {ai_analysis['intent_score']}/10)")

        # Step 7: Send alert
        send_alert.delay(signal_id)

        # Log usage
        db.log_usage(
            user_id,
            'signal_detected',
            {
                'signal_id': signal_id,
                'platform': signal_data['platform'],
                'intent_score': ai_analysis['intent_score']
            }
        )

        return f"Signal {signal_id} created and queued for alert"

    except Exception as e:
        print(f"Failed to save signal: {e}")
        return f"Save failed: {e}"

Alert Tasks
File: backend/tasks/alert_tasks.py

python
"""
Tasks for sending email and Slack alerts
"""

from celery_app import celery_app
from database.db import db
from utils.notifications import send_email_alert, send_slack_alert
from datetime import datetime, timedelta

@celery_app.task(name='tasks.alert_tasks.send_alert')
def send_alert(signal_id: str):
"""
Send real-time alert for new signal
Checks user's alert settings first
"""
signal = db.get_signal_with_details(signal_id)

    if not signal:
        return "Signal not found"

    user = db.get_user(signal['user_id'])
    settings = db.get_alert_settings(signal['user_id'])

    # Check alert frequency preference
    if settings['email_frequency'] == 'daily_digest':
        # Don't send real-time, will be included in digest
        return "Will be sent in daily digest"

    # Check minimum intent score for alerts
    if signal['intent_score'] < settings.get('min_intent_score', 7):
        return f"Intent score below user's alert threshold"

    # Send email alert
    if settings['email_enabled']:
        try:
            send_email_alert(user['email'], signal)
            print(f"Email alert sent to {user['email']}")
        except Exception as e:
            print(f"Email alert failed: {e}")

    # Send Slack alert
    if settings['slack_enabled'] and settings['slack_webhook_url']:
        try:
            send_slack_alert(settings['slack_webhook_url'], signal)
            print(f"Slack alert sent")
        except Exception as e:
            print(f"Slack alert failed: {e}")

    return "Alert sent"

@celery_app.task(name='tasks.alert_tasks.send_daily_digests')
def send_daily_digests():
"""
Send daily digest emails to users who prefer them
Runs at 8 AM UTC daily
""" # This would query users with daily_digest preference # and send summary of yesterday's signals

    # Simplified for MVP - you can implement later
    return "Daily digests sent"

Cleanup Tasks
File: backend/tasks/cleanup_tasks.py

python
"""
Periodic cleanup and maintenance tasks
"""

from celery_app import celery_app
import psycopg2
import os

@celery_app.task(name='tasks.cleanup_tasks.archive_old_signals')
def archive_old_signals():
"""
Archive signals older than 90 days
Runs daily at 2 AM
"""
conn = psycopg2.connect(os.getenv("DATABASE_URL"))
cur = conn.cursor()

    cur.execute("""
        UPDATE signals
        SET is_archived = true
        WHERE detected_at < NOW() - INTERVAL '90 days'
          AND is_archived = false
    """)

    archived_count = cur.rowcount
    conn.commit()
    cur.close()
    conn.close()

    return f"Archived {archived_count} old signals"

Week 3: Contact Enrichment
File: backend/enrichment/enrichment_service.py

python
"""
Contact enrichment service using multiple sources
Pipeline: Find LinkedIn → Scrape profile → Find email
"""

import requests
from typing import Optional, Dict
import os
from database.db import db

class EnrichmentService:
def **init**(self):
self.hunter_key = os.getenv('HUNTER_API_KEY')
self.serpapi_key = os.getenv('SERPAPI_KEY')
self.brightdata_key = os.getenv('BRIGHTDATA_API_KEY')

    def enrich_contact(self, signal_id: str, user_id: str, signal: Dict) -> Optional[Dict]:
        """
        Multi-step enrichment pipeline

        Returns enriched contact dict or None if failed
        """

        # Check user has credits
        user = db.get_user(user_id)
        if user['enrichment_credits'] <= 0:
            raise ValueError("No enrichment credits remaining")

        # Step 1: Find LinkedIn profile
        linkedin_url = self._find_linkedin_profile(signal)

        if not linkedin_url:
            # Try fallback enrichment from platform profile
            return self._try_platform_enrichment(signal_id, user_id, signal)

        # Step 2: Scrape LinkedIn profile
        profile_data = self._scrape_linkedin_profile(linkedin_url)

        if not profile_data:
            return None

        # Step 3: Find email with fallbacks
        email_data = self._find_email_multi_source(profile_data)

        # Build enriched contact
        enriched = {
            'signal_id': signal_id,
            'user_id': user_id,
            'full_name': f"{profile_data.get('first_name', '')} {profile_data.get('last_name', '')}".strip(),
            'email': email_data.get('email'),
            'email_confidence': email_data.get('confidence', 'unknown'),
            'company': profile_data.get('company'),
            'job_title': profile_data.get('job_title'),
            'linkedin_url': linkedin_url,
            'company_size': profile_data.get('company_size'),
            'industry': profile_data.get('industry'),
            'enrichment_source': email_data.get('source', 'unknown')
        }

        # Save and decrement credits
        contact_id = db.create_enriched_contact(enriched)
        db.decrement_credits(user_id, 1)

        db.log_usage(user_id, 'contact_enriched', {
            'contact_id': contact_id,
            'signal_id': signal_id,
            'success': bool(email_data.get('email'))
        })

        return enriched

    def _find_linkedin_profile(self, signal: Dict) -> Optional[str]:
        """Find LinkedIn profile URL from username"""

        platform = signal['platform']
        username = signal['author_username']

        # If already from LinkedIn, we have it
        if platform == 'linkedin':
            return signal.get('author_profile_url')

        # Use SerpAPI to Google search for LinkedIn profile
        if not self.serpapi_key:
            return None

        try:
            search_query = f"{username} linkedin profile"

            response = requests.get(
                "https://serpapi.com/search",
                params={
                    'q': search_query,
                    'api_key': self.serpapi_key,
                    'num': 5
                },
                timeout=10
            )

            if response.status_code != 200:
                return None

            results = response.json().get('organic_results', [])

            # Find first LinkedIn profile URL
            for result in results:
                link = result.get('link', '')
                if 'linkedin.com/in/' in link:
                    return link

            return None

        except Exception as e:
            print(f"LinkedIn profile search failed: {e}")
            return None

    def _scrape_linkedin_profile(self, linkedin_url: str) -> Optional[Dict]:
        """Scrape LinkedIn profile using Bright Data"""

        if not self.brightdata_key:
            return None

        try:
            # Trigger Bright Data LinkedIn Profile scraper
            response = requests.post(
                "https://api.brightdata.com/datasets/v3/trigger",
                headers={"Authorization": f"Bearer {self.brightdata_key}"},
                json={
                    "dataset_id": "gd_l7q7dkf244hwjntr0",
                    "discover_by": [{
                        "type": "url",
                        "url": linkedin_url
                    }]
                },
                timeout=10
            )

            if response.status_code != 200:
                return None

            snapshot_id = response.json()['snapshot_id']

            # Wait for results (simplified - you'd poll properly)
            import time
            time.sleep(15)

            # Get results
            result_response = requests.get(
                f"https://api.brightdata.com/datasets/v3/snapshot/{snapshot_id}",
                headers={"Authorization": f"Bearer {self.brightdata_key}"}
            )

            if result_response.status_code != 200:
                return None

            data = result_response.json()

            if data['status'] != 'ready' or not data.get('data'):
                return None

            profile = data['data'][0]

            return {
                'first_name': profile.get('first_name', ''),
                'last_name': profile.get('last_name', ''),
                'job_title': profile.get('headline', ''),
                'company': profile.get('company', ''),
                'company_size': profile.get('company_size', ''),
                'industry': profile.get('industry', '')
            }

        except Exception as e:
            print(f"LinkedIn scraping failed: {e}")
            return None

    def _find_email_multi_source(self, profile_data: Dict) -> Dict:
        """Try multiple email finding services"""

        # Try Hunter.io first
        email = self._hunter_find_email(profile_data)
        if email:
            return {'email': email, 'confidence': 'verified', 'source': 'hunter'}

        # Fallback: Guess email pattern
        email = self._guess_email_pattern(profile_data)
        if email:
            return {'email': email, 'confidence': 'guessed', 'source': 'pattern'}

        return {}

    def _hunter_find_email(self, profile_data: Dict) -> Optional[str]:
        """Use Hunter.io Email Finder API"""

        if not self.hunter_key:
            return None

        company_domain = self._get_company_domain(profile_data.get('company', ''))

        if not company_domain:
            return None

        try:
            response = requests.get(
                "https://api.hunter.io/v2/email-finder",
                params={
                    'domain': company_domain,
                    'first_name': profile_data.get('first_name', ''),
                    'last_name': profile_data.get('last_name', ''),
                    'api_key': self.hunter_key
                },
                timeout=10
            )

            if response.status_code != 200:
                return None

            data = response.json()

            return data.get('data', {}).get('email')

        except Exception as e:
            print(f"Hunter.io failed: {e}")
            return None

    def _guess_email_pattern(self, profile_data: Dict) -> Optional[str]:
        """Guess email based on common patterns"""

        first = profile_data.get('first_name', '').lower().strip()
        last = profile_data.get('last_name', '').lower().strip()
        company = profile_data.get('company', '')

        if not first or not last or not company:
            return None

        domain = self._get_company_domain(company)

        if not domain:
            return None

        # Most common pattern
        return f"{first}.{last}@{domain}"

    def _get_company_domain(self, company_name: str) -> Optional[str]:
        """Get company domain from name (simplified)"""

        if not company_name:
            return None

        # Remove common suffixes
        clean = company_name.lower()
        for suffix in [' inc', ' llc', ' ltd', ' corp', ' corporation']:
            clean = clean.replace(suffix, '')

        # Remove special chars and spaces
        clean = ''.join(c for c in clean if c.isalnum())

        return f"{clean}.com"

    def _try_platform_enrichment(self, signal_id: str, user_id: str, signal: Dict) -> Optional[Dict]:
        """Fallback enrichment from platform profile"""

        # For HN/Reddit, scrape user profile for company mentions
        # This is a fallback when LinkedIn isn't found
        # Simplified for MVP - just return basic info

        enriched = {
            'signal_id': signal_id,
            'user_id': user_id,
            'full_name': signal.get('author_username', 'Unknown'),
            'email': None,
            'email_confidence': 'none',
            'company': None,
            'job_title': None,
            'linkedin_url': None,
            'company_size': None,
            'industry': None,
            'enrichment_source': 'platform_profile'
        }

        contact_id = db.create_enriched_contact(enriched)
        db.decrement_credits(user_id, 1)

        return enriched

# Global instance

enrichment_service = EnrichmentService()
Week 3-4: Frontend Dashboard
Due to length limitations, I'll provide the key frontend files. The full frontend would be too long for one message.

File: frontend/package.json

json
{
"name": "intent-signals-frontend",
"version": "1.0.0",
"private": true,
"scripts": {
"dev": "next dev",
"build": "next build",
"start": "next start"
},
"dependencies": {
"@tanstack/react-query": "^5.17.19",
"@radix-ui/react-badge": "latest",
"@radix-ui/react-button": "latest",
"@radix-ui/react-card": "latest",
"@radix-ui/react-dialog": "latest",
"@radix-ui/react-tabs": "latest",
"next": "14.1.0",
"react": "^18",
"react-dom": "^18",
"tailwindcss": "^3.4.0",
"lucide-react": "^0.309.0"
},
"devDependencies": {
"@types/node": "^20",
"@types/react": "^18",
"@types/react-dom": "^18",
"typescript": "^5"
}
}
File: frontend/app/dashboard/page.tsx (simplified)

typescript
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SignalCard } from '@/components/signal-card'
import { StatCard } from '@/components/stat-card'

export default function Dashboard() {
const queryClient = useQueryClient()

const { data: signals } = useQuery({
queryKey: ['signals'],
queryFn: () => fetch('/api/signals').then(r => r.json()),
refetchInterval: 30000
})

const { data: stats } = useQuery({
queryKey: ['stats'],
queryFn: () => fetch('/api/stats').then(r => r.json())
})

const enrichMutation = useMutation({
mutationFn: (signalId: string) =>
fetch(`/api/signals/${signalId}/enrich`, { method: 'POST' }).then(r => r.json()),
onSuccess: () => queryClient.invalidateQueries({ queryKey: ['signals'] })
})

return (
<div className="container mx-auto p-6">
<div className="grid grid-cols-4 gap-4 mb-8">
<StatCard title="Today" value={stats?.today || 0} />
<StatCard title="This Week" value={stats?.week || 0} />
<StatCard title="High Intent" value={stats?.high_intent || 0} />
<StatCard title="Credits" value={stats?.credits || 0} />
</div>

      <div className="space-y-4">
        {signals?.map((signal) => (
          <SignalCard
            key={signal.id}
            signal={signal}
            onEnrich={() => enrichMutation.mutate(signal.id)}
          />
        ))}
      </div>
    </div>

)
}
Environment Setup
File: backend/.env

bash

# Database (from Supabase)

DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your_anon_key

# Redis

REDIS_URL=redis://default:[password]@redis-xxx.upstash.io:6379

# Scraping APIs

REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_secret
TWITTER_BEARER_TOKEN=your_twitter_token
BRIGHTDATA_API_KEY=your_brightdata_key

# Email Finding

HUNTER_API_KEY=your_hunter_key
SERPAPI_KEY=your_serpapi_key

# AI

OPENAI_API_KEY=sk-proj-...

# Email

SENDGRID_API_KEY=SG....
FROM_EMAIL=alerts@yourdomain.com

# Auth

JWT_SECRET=your_random_secret_key

# Stripe

STRIPE*SECRET_KEY=sk_test*...
STRIPE*WEBHOOK_SECRET=whsec*...
Dependencies
File: backend/requirements.txt

text

# Core

fastapi==0.109.0
uvicorn[standard]==0.27.0
python-dotenv==1.0.0
pydantic==2.6.0

# Database (NO SQLAlchemy)

psycopg2-binary==2.9.9
supabase==2.3.0

# Background jobs

celery==5.3.6
redis==5.0.1

# Scraping

praw==7.7.1
tweepy==4.14.0
requests==2.31.0

# AI

openai==1.10.0

# Auth & Security

python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6

# Email

sendgrid==6.11.0

# Payment

stripe==8.0.0

# Utils

python-dateutil==2.8.2
