import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../contexts/TranslationContext';
import { useFirebase } from '../contexts/FirebaseContext';
import Markdown from 'react-markdown';
import { db, collection, addDoc, Timestamp, query, orderBy, onSnapshot, OperationType, handleFirestoreError, deleteDoc, doc, where, storage, ref, uploadBytes, uploadBytesResumable, getDownloadURL, limit, increment, updateDoc, setDoc, arrayUnion, getDoc, runTransaction, or } from '../lib/firebase';
import { 
  LayoutDashboard, 
  Users, 
  Video, 
  Workflow, 
  Shield, 
  Settings, 
  Search, 
  Bell, 
  Youtube, 
  Instagram, 
  Music, 
  Facebook, 
  Twitter, 
  FileText, 
  TrendingUp, 
  MessageSquare, 
  Globe, 
  Zap, 
  ExternalLink, 
  Mail, 
  ChevronRight, 
  ChevronLeft,
  Hash,
  Plus, 
  AlertCircle, 
  AlertTriangle,
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  Lock,
  Image,
  Heart,
  Share2,
  MoreHorizontal,
  Flag,
  UserX,
  Bookmark,
  Upload,
  Trash2,
  File,
  Download,
  Sparkles,
  Send,
  Mic,
  RefreshCw,
  ShoppingBag,
  ShieldAlert,
  Play,
  Wallet,
  Star,
  Music2,
  MapPin,
  Calendar,
  History,
  CreditCard
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { getGeminiModel, ai } from '../lib/gemini';
import { GoogleGenAI, GenerateContentResponse, Modality } from '@google/genai';
import ErrorBoundary from './ErrorBoundary';

// Refactored Components
import Discovery from './creatorbook/Discovery';
import WalletView from './creatorbook/Wallet';
import Automations from './creatorbook/Automations';
import MessagesView from './creatorbook/Messages';
import Dashboard from './creatorbook/Dashboard';
import CreatorProfile from './creatorbook/CreatorProfile';
import FeedPost from './creatorbook/FeedPost';
import C2PAVerification from './creatorbook/C2PAVerification';

export interface VaultItem {
  id: string;
  userId: string;
  name: string;
  url: string;
  size: number;
  type: string;
  c2paManifest?: string;
  createdAt: any;
}

export default function CreatorBook() {
  return (
    <ErrorBoundary>
      <CreatorBookContent />
    </ErrorBoundary>
  );
}

const TrustScore = ({ score }: { score: number }) => {
  const getColor = () => {
    if (score < 30) return '#ef4444'; // red-500
    if (score < 70) return '#f59e0b'; // amber-500
    return '#10b981'; // emerald-500
  };

  const getLabel = () => {
    if (score < 30) return 'At Risk';
    if (score < 70) return 'Building';
    return 'Trusted';
  };

  return (
    <div style={{ 
      padding: '24px', 
      backgroundColor: 'rgba(255, 255, 255, 0.03)', 
      border: '1px border rgba(255, 255, 255, 0.1)', 
      borderRadius: '32px',
      backdropFilter: 'blur(12px)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255, 255, 255, 0.4)' }}>
          Trust Score
        </h3>
        <span style={{ 
          padding: '4px 12px', 
          borderRadius: '9999px', 
          fontSize: '10px', 
          fontWeight: '900', 
          textTransform: 'uppercase', 
          letterSpacing: '0.05em',
          backgroundColor: `${getColor()}20`,
          color: getColor(),
          border: `1px solid ${getColor()}40`
        }}>
          {getLabel()}
        </span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '32px', fontWeight: '900', color: '#fff' }}>{score}</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.2)' }}>/ 100</span>
      </div>

      <div style={{ 
        width: '100%', 
        height: '8px', 
        backgroundColor: 'rgba(255, 255, 255, 0.05)', 
        borderRadius: '9999px',
        overflow: 'hidden'
      }}>
        <div style={{ 
          width: `${score}%`, 
          height: '100%', 
          backgroundColor: getColor(),
          borderRadius: '9999px',
          transition: 'width 1s ease-in-out',
          boxShadow: `0 0 15px ${getColor()}40`
        }} />
      </div>
      
      <p style={{ marginTop: '12px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', lineHeight: '1.5' }}>
        Your score is based on identity verification, content provenance, and community feedback.
      </p>
    </div>
  );
};

function CreatorBookContent() {
  const { t } = useTranslation();
  const { user, profile } = useFirebase();
  const [marketSearch, setMarketSearch] = useState('');
  const [marketCategory, setMarketCategory] = useState('All');
  const [marketVerifiedOnly, setMarketVerifiedOnly] = useState(false);
  const [marketMinFollowers, setMarketMinFollowers] = useState('All');
  const [marketLanguage, setMarketLanguage] = useState('All');
  const [marketCountry, setMarketCountry] = useState('All');
  const [marketPlatform, setMarketPlatform] = useState('All');
  const [marketSortBy, setMarketSortBy] = useState('relevance');
  const [showMarketFilters, setShowMarketFilters] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<any>(null);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [studioVideo, setStudioVideo] = useState<string | null>(null);
  const [studioAudio, setStudioAudio] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const topupSuccess = urlParams.get('topup_success');
    const topupCanceled = urlParams.get('topup_canceled');
    const bookingSuccess = urlParams.get('booking_success');
    const bookingCanceled = urlParams.get('booking_canceled');
    const sessionId = urlParams.get('session_id');

    if (topupSuccess) {
      const amount = urlParams.get('amount');
      toast.success(`Successfully topped up €${amount}! Your balance will be updated shortly.`);
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (topupCanceled) {
      toast.error("Top-up was canceled.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (bookingSuccess) {
      toast.success("Booking confirmed! The creator will be notified shortly.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (bookingCanceled) {
      toast.error("Booking was canceled.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (sessionId) {
      const verifySession = async () => {
        try {
          const response = await fetch(`/api/verify-session/${sessionId}`);
          const data = await response.json();
          if (data.success) {
            toast.success(`Plan upgraded to ${data.plan}!`);
          }
        } catch (error) {
          console.error("Session verification failed:", error);
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      };
      verifySession();
    }

    const stripeConnect = urlParams.get('stripe_connect');
    if (stripeConnect === 'success') {
      toast.success("Stripe Connect account linked successfully!");
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (stripeConnect === 'refresh') {
      toast.error("Stripe Connect onboarding was interrupted. Please try again.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  const [topUpAmount, setTopUpAmount] = useState('50');

  const handleBooking = async (creator: any) => {
    if (!user) {
      toast.error("Please sign in to book a creator.");
      return;
    }
    setSelectedCreator(creator);
    setShowBookingModal(true);
  };

  const handleCreateGroup = async () => {
    if (!user || !newGroupName.trim()) return;
    try {
      await addDoc(collection(db, 'groups'), {
        name: newGroupName,
        description: newGroupDescription,
        members: '1',
        image: `https://picsum.photos/seed/${newGroupName}/200/200`,
        creatorId: user.uid,
        createdAt: Timestamp.now()
      });
      toast.success("Group created successfully!");
      setShowGroupModal(false);
      setNewGroupName('');
      setNewGroupDescription('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'groups');
    }
  };

  const handleStripeConnect = async () => {
    if (!user) return;
    try {
      const response = await fetch('/api/stripe/connect/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, email: user.email })
      });
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      const linkResponse = await fetch('/api/stripe/connect/create-account-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: data.accountId })
      });
      const linkData = await linkResponse.json();
      
      if (linkData.error) throw new Error(linkData.error);
      
      window.location.href = linkData.url;
    } catch (error: any) {
      console.error("Stripe Connect Error:", error);
      toast.error(error.message || "Failed to start Stripe Connect onboarding.");
    }
  };

  const handleStripeDashboard = async () => {
    if (!profile?.stripeConnectId) return;
    try {
      const response = await fetch(`/api/stripe/connect/login-link/${profile.stripeConnectId}`);
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
      window.open(data.url, '_blank');
    } catch (error: any) {
      console.error("Stripe Dashboard Error:", error);
      toast.error(error.message || "Failed to open Stripe Dashboard.");
    }
  };

  const [showCreatorProfile, setShowCreatorProfile] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingService, setBookingService] = useState('Dedicated Video');
  const [bookingDetails, setBookingDetails] = useState('');
  const [marketCreators, setMarketCreators] = useState<any[]>([]);
  const [myInquiries, setMyInquiries] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({ name: '', trigger: 'New Follower', action: 'Send Welcome DM' });
  const [newWebhook, setNewWebhook] = useState({ name: '', url: '', events: ['booking.created'] });

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'creator'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const creators = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Provide fallbacks for missing fields
        category: doc.data().category || 'Lifestyle',
        followers: doc.data().followers || '0',
        trustScore: doc.data().trustScore || 50,
        price: doc.data().price || '€0+',
        bio: doc.data().bio || 'Creator on CreatorSeal',
        demographics: doc.data().demographics || {
          ageGroups: [
            { label: '18-24', value: 45 },
            { label: '25-34', value: 30 },
            { label: '35-44', value: 15 },
            { label: '45+', value: 10 }
          ],
          topLocations: [
            { label: 'USA', value: 40 },
            { label: 'UK', value: 20 },
            { label: 'Germany', value: 15 },
            { label: 'Others', value: 25 }
          ]
        }
      }));
      setMarketCreators(creators);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const qInquiries = query(
      collection(db, 'inquiries'), 
      where('senderId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeInquiries = onSnapshot(qInquiries, (snapshot) => {
      setMyInquiries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'inquiries'));

    const qBookings = query(
      collection(db, 'bookings'), 
      where('clientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeBookings = onSnapshot(qBookings, (snapshot) => {
      setMyBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'bookings'));

    const qWorkflows = query(
      collection(db, 'workflows'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeWorkflows = onSnapshot(qWorkflows, (snapshot) => {
      setWorkflows(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'workflows'));

    const qWebhooks = query(
      collection(db, 'webhooks'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeWebhooks = onSnapshot(qWebhooks, (snapshot) => {
      setWebhooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'webhooks'));

    return () => {
      unsubscribeInquiries();
      unsubscribeBookings();
      unsubscribeWorkflows();
      unsubscribeWebhooks();
    };
  }, [user]);

  const getDemographics = (creator: any) => {
    if (creator?.demographics) return creator.demographics;
    
    const category = creator?.category || 'Lifestyle';
    const demographics: any = {
      'Tech': { 
        ageGroups: [{ label: '18-24', value: 30 }, { label: '25-34', value: 50 }, { label: '35-44', value: 15 }, { label: '45+', value: 5 }],
        topLocations: [{ label: 'USA', value: 50 }, { label: 'India', value: 20 }, { label: 'Germany', value: 10 }, { label: 'Others', value: 20 }]
      },
      'Lifestyle': { 
        ageGroups: [{ label: '18-24', value: 45 }, { label: '25-34', value: 35 }, { label: '35-44', value: 15 }, { label: '45+', value: 5 }],
        topLocations: [{ label: 'USA', value: 40 }, { label: 'UK', value: 20 }, { label: 'Germany', value: 15 }, { label: 'Others', value: 25 }]
      },
      'Gaming': { 
        ageGroups: [{ label: '18-24', value: 60 }, { label: '25-34', value: 25 }, { label: '35-44', value: 10 }, { label: '45+', value: 5 }],
        topLocations: [{ label: 'USA', value: 35 }, { label: 'Brazil', value: 15 }, { label: 'Japan', value: 10 }, { label: 'Others', value: 40 }]
      },
      'Fashion': { 
        ageGroups: [{ label: '18-24', value: 50 }, { label: '25-34', value: 30 }, { label: '35-44', value: 15 }, { label: '45+', value: 5 }],
        topLocations: [{ label: 'France', value: 30 }, { label: 'USA', value: 25 }, { label: 'Italy', value: 15 }, { label: 'Others', value: 30 }]
      },
      'Finance': { 
        ageGroups: [{ label: '18-24', value: 15 }, { label: '25-34', value: 55 }, { label: '35-44', value: 20 }, { label: '45+', value: 10 }],
        topLocations: [{ label: 'USA', value: 60 }, { label: 'Canada', value: 15 }, { label: 'UK', value: 10 }, { label: 'Others', value: 15 }]
      },
    };

    return demographics[category] || demographics['Lifestyle'];
  };

  const filteredCreators = marketCreators
    .filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(marketSearch.toLowerCase()) || 
                          c.handle.toLowerCase().includes(marketSearch.toLowerCase());
      const matchesCategory = marketCategory === 'All' || c.category === marketCategory;
      const matchesVerified = !marketVerifiedOnly || c.verified;
      const matchesLanguage = marketLanguage === 'All' || c.language === marketLanguage;
      const matchesCountry = marketCountry === 'All' || c.country === marketCountry;
      const matchesPlatform = marketPlatform === 'All' || (c.platforms && c.platforms.includes(marketPlatform));
      
      let matchesFollowers = true;
      if (marketMinFollowers !== 'All') {
        const count = parseFloat(c.followers.replace(/[^0-9.]/g, ''));
        const multiplier = c.followers.includes('M') ? 1000000 : (c.followers.includes('k') ? 1000 : 1);
        const total = count * multiplier;
        if (marketMinFollowers === '100k+') matchesFollowers = total >= 100000;
        if (marketMinFollowers === '500k+') matchesFollowers = total >= 500000;
        if (marketMinFollowers === '1M+') matchesFollowers = total >= 1000000;
      }
      
      return matchesSearch && matchesCategory && matchesVerified && matchesFollowers && matchesLanguage && matchesCountry && matchesPlatform;
    })
    .sort((a, b) => {
      if (marketSortBy === 'reach') {
        const getCount = (s: string) => {
          const count = parseFloat(s.replace(/[^0-9.]/g, ''));
          const multiplier = s.includes('M') ? 1000000 : (s.includes('k') ? 1000 : 1);
          return count * multiplier;
        };
        return getCount(b.followers) - getCount(a.followers);
      }
      if (marketSortBy === 'trust') return b.trustScore - a.trustScore;
      if (marketSortBy === 'newest') return (b.createdAt || 0) - (a.createdAt || 0);
      return 0; // relevance (default)
    });

  const handleCreateWorkflow = async () => {
    if (!user || !newWorkflow.name.trim()) return;
    try {
      await addDoc(collection(db, 'workflows'), {
        userId: user.uid,
        name: newWorkflow.name,
        trigger: newWorkflow.trigger,
        action: newWorkflow.action,
        status: 'Active',
        createdAt: Timestamp.now()
      });
      toast.success("Workflow created successfully!");
      setShowWorkflowModal(false);
      setNewWorkflow({ name: '', trigger: 'New Follower', action: 'Send Welcome DM' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'workflows');
    }
  };

  const handleToggleWorkflow = async (workflowId: string, currentStatus: string) => {
    try {
      await updateDoc(doc(db, 'workflows', workflowId), {
        status: currentStatus === 'Active' ? 'Inactive' : 'Active'
      });
      toast.success("Workflow status updated!");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'workflows');
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    try {
      await deleteDoc(doc(db, 'workflows', workflowId));
      toast.success("Workflow deleted!");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'workflows');
    }
  };

  const handleCreateWebhook = async () => {
    if (!user || !newWebhook.name.trim() || !newWebhook.url.trim()) return;
    try {
      await addDoc(collection(db, 'webhooks'), {
        userId: user.uid,
        name: newWebhook.name,
        url: newWebhook.url,
        events: newWebhook.events,
        isActive: true,
        secret: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        createdAt: Timestamp.now()
      });
      toast.success("Webhook created successfully!");
      setShowWebhookModal(false);
      setNewWebhook({ name: '', url: '', events: ['booking.created'] });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'webhooks');
    }
  };

  const handleToggleWebhook = async (webhookId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'webhooks', webhookId), {
        isActive: !currentStatus
      });
      toast.success("Webhook status updated!");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'webhooks');
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      await deleteDoc(doc(db, 'webhooks', webhookId));
      toast.success("Webhook deleted!");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'webhooks');
    }
  };

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'transactions'));
    return () => unsubscribe();
  }, [user]);

  const simulateTopUp = async () => {
    if (!user || !topUpAmount) return;
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) return;

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw new Error("User not found");
        
        const currentBalance = userDoc.data().balance || 0;
        transaction.update(userRef, { balance: currentBalance + amount });

        const transactionRef = doc(collection(db, 'transactions'));
        transaction.set(transactionRef, {
          userId: user.uid,
          amount: amount,
          type: 'topup',
          description: `Top up via Demo Payment`,
          status: 'completed',
          createdAt: Timestamp.now()
        });
      });
      toast.success(`Successfully topped up €${amount.toFixed(2)}!`);
      setShowTopUpModal(false);
    } catch (err) {
      console.error("Top up failed: ", err);
      toast.error("Top up failed");
    }
  };

  const handleUpgrade = async (priceId: string) => {
    if (!user) {
      toast.error("Please login to upgrade your plan.");
      return;
    }
    
    try {
      toast.loading("Redirecting to checkout...");
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.uid,
        }),
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.dismiss();
        toast.error(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("An error occurred. Please try again later.");
      console.error(error);
    }
  };

  const handleTopUp = async () => {
    if (!user) {
      toast.error("Please login to top up your balance.");
      return;
    }
    
    try {
      toast.loading(`Redirecting to payment provider to top up €${topUpAmount}...`);
      
      const response = await fetch('/api/create-topup-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: topUpAmount,
          userId: user.uid,
        }),
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.dismiss();
        toast.error(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("An error occurred. Please try again later.");
      console.error(error);
    }
  };

  const handleSendInquiry = async () => {
    if (!selectedCreator || !inquiryMessage.trim()) return;
    try {
      await addDoc(collection(db, 'inquiries'), {
        senderId: user?.uid,
        receiverId: selectedCreator.id,
        message: inquiryMessage,
        status: 'pending',
        createdAt: Timestamp.now()
      });
      toast.success("Inquiry sent successfully!");
      setShowInquiryModal(false);
      setInquiryMessage('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'inquiries');
    }
  };

  const handleBookNow = async () => {
    if (!selectedCreator || !bookingDetails.trim() || !user) return;
    
    // Calculate price based on selected service
    let basePrice = parseFloat(selectedCreator.price.replace(/[^0-9.]/g, ''));
    if (isNaN(basePrice)) basePrice = 100; // Fallback
    
    let finalPrice = basePrice;
    if (bookingService === 'Shoutout') finalPrice = basePrice * 0.6;
    if (bookingService === 'Social Post') finalPrice = basePrice * 0.3;

    if (!profile?.balance || profile.balance < finalPrice) {
      toast.error(`Insufficient balance. You need €${finalPrice.toFixed(2)}.`);
      setShowBookingModal(false);
      setShowTopUpModal(true);
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new Error("User profile not found");
        }
        
        const currentBalance = userDoc.data().balance || 0;
        if (currentBalance < finalPrice) {
          throw new Error("Insufficient balance");
        }
        
        // Deduct balance
        transaction.update(userRef, {
          balance: currentBalance - finalPrice
        });
        
        // Create booking
        const bookingRef = doc(collection(db, 'bookings'));
        transaction.set(bookingRef, {
          clientId: user.uid,
          creatorId: selectedCreator.id,
          serviceType: bookingService,
          details: bookingDetails,
          price: finalPrice,
          status: 'pending',
          createdAt: Timestamp.now()
        });

        // Create transaction record
        const transactionRef = doc(collection(db, 'transactions'));
        transaction.set(transactionRef, {
          userId: user.uid,
          amount: finalPrice,
          type: 'payment',
          description: `Booking: ${bookingService} with ${selectedCreator.name}`,
          status: 'completed',
          createdAt: Timestamp.now()
        });
      });
      
      toast.success(`Booking successful! €${finalPrice.toFixed(2)} deducted.`);
      setShowBookingModal(false);
      setBookingDetails('');
    } catch (err) {
      console.error("Booking transaction failed: ", err);
      toast.error(err instanceof Error ? err.message : "Booking failed");
      handleFirestoreError(err, OperationType.WRITE, 'bookings/users');
    }
  };

  const handleStripeBooking = async () => {
    if (!user || !selectedCreator) return;

    let basePrice = parseFloat(selectedCreator.price.replace(/[^0-9.]/g, ''));
    if (isNaN(basePrice)) basePrice = 100;
    let finalPrice = basePrice;
    if (bookingService === 'Shoutout') finalPrice = basePrice * 0.6;
    if (bookingService === 'Social Post') finalPrice = basePrice * 0.3;

    try {
      const response = await fetch('/api/create-booking-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: selectedCreator.id,
          creatorName: selectedCreator.name,
          serviceType: bookingService,
          price: finalPrice,
          details: bookingDetails,
          userId: user.uid
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (err) {
      console.error("Stripe booking error:", err);
      toast.error("Failed to initiate Stripe checkout");
    }
  };
  const [reports, setReports] = useState<any[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [isModerator, setIsModerator] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    // Check if user is admin/moderator
    const checkModerator = async () => {
      if (user.email === 'realsyncdynamics@gmail.com') {
        setIsModerator(true);
        return;
      }
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        setIsModerator(true);
      }
    };
    checkModerator();

    // Listen for reports if moderator
    let unsubscribeReports: any;
    let unsubscribeVerifications: any;

    if (isModerator) {
      unsubscribeReports = onSnapshot(query(collection(db, 'reports'), orderBy('createdAt', 'desc')), (snapshot) => {
        setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'reports'));

      unsubscribeVerifications = onSnapshot(query(collection(db, 'verificationRequests'), orderBy('createdAt', 'desc')), (snapshot) => {
        setVerificationRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'verificationRequests'));
    }

    return () => {
      unsubscribeReports?.();
      unsubscribeVerifications?.();
    };
  }, [user, isModerator]);

  const handleUpdateReportStatus = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      await updateDoc(doc(db, 'reports', reportId), { status });
      toast.success(`Report ${status}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'reports');
    }
  };

  const handleUpdateVerificationStatus = async (requestId: string, userId: string, status: 'approved' | 'rejected', level: string) => {
    try {
      await updateDoc(doc(db, 'verificationRequests', requestId), { status });
      if (status === 'approved') {
        await updateDoc(doc(db, 'users', userId), { verificationLevel: level });
      }
      toast.success(`Verification ${status}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'verificationRequests');
    }
  };
  const [activeView, setActiveView] = useState<'dashboard' | 'community' | 'groups' | 'studio' | 'automation' | 'security' | 'messages' | 'notifications' | 'settings' | 'profile' | 'market' | 'inquiries' | 'bookings' | 'legal' | 'wallet' | 'pricing' | 'vault' | 'marketplace' | 'c2pa'>('dashboard');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [syncContent, setSyncContent] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [isGeneratingSecurityVideo, setIsGeneratingSecurityVideo] = useState(false);
  const [securityVideoUrl, setSecurityVideoUrl] = useState<string | null>(null);
  const [securityVideoStatus, setSecurityVideoStatus] = useState("");
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analyzingPost, setAnalyzingPost] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Studio Tools State
  const [studioInput, setStudioInput] = useState('');
  const [studioOutput, setStudioOutput] = useState('');
  const [studioLoading, setStudioLoading] = useState(false);
  const [studioImage, setStudioImage] = useState<string | null>(null);

  const handleGenerateSecurityVideo = async (prompt: string) => {
    if (!user) return;
    
    // Check for API key selection for Veo models
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
        // Continue after key selection (assuming success as per instructions)
      }
    }

    setIsGeneratingSecurityVideo(true);
    setSecurityVideoStatus(t('ai.video.status.init'));
    setShowVideoModal(true);
    setSecurityVideoUrl(null);

    try {
      // Re-initialize AI to ensure it uses the latest key
      const currentAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      let operation = await currentAi.models.generateVideos({
        model: 'veo-3.1-lite-generate-preview',
        prompt: `Explain this security threat: ${prompt}. Make it professional and informative for a creator.`,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      setSecurityVideoStatus(t('ai.video.status.poll'));

      // Poll for completion
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await currentAi.operations.getVideosOperation({ operation: operation });
        
        // Update status messages to keep user engaged
        const statuses = [
          t('ai.video.status.analyzing'),
          t('ai.video.status.synthesizing'),
          t('ai.video.status.rendering'),
          t('ai.video.status.finalizing')
        ];
        setSecurityVideoStatus(statuses[Math.floor(Math.random() * statuses.length)]);
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': process.env.GEMINI_API_KEY || '',
          },
        });
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setSecurityVideoUrl(url);
        setSecurityVideoStatus(t('ai.video.status.success'));
      } else {
        throw new Error("Failed to get video download link.");
      }
    } catch (error: any) {
      console.error("Video Generation Error:", error);
      setSecurityVideoStatus(`Error: ${error.message}`);
      if (error.message.includes("Requested entity was not found")) {
        // Reset key selection if needed (as per instructions)
        if (typeof window !== 'undefined' && (window as any).aistudio) {
          await (window as any).aistudio.openSelectKey();
        }
      }
    } finally {
      setIsGeneratingSecurityVideo(false);
    }
  };

  const handleStudioToolAction = async () => {
    if (!selectedTool || !studioInput) return;
    setStudioLoading(true);
    setStudioOutput('');
    setStudioImage(null);
    setStudioVideo(null);
    setStudioAudio(null);

    try {
      const currentAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      if (selectedTool.id === 4) { // Thumbnail Generator
        const response = await currentAi.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: `Create a high-quality, viral YouTube thumbnail for a video about: ${studioInput}. The style should be modern, vibrant, and eye-catching.` }]
          },
          config: {
            imageConfig: {
              aspectRatio: "16:9"
            }
          }
        });

        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              const base64EncodeString = part.inlineData.data;
              setStudioImage(`data:image/png;base64,${base64EncodeString}`);
            }
          }
        }
        setStudioOutput(t('cb.studio.thumbnail_gen.success') || 'Thumbnail generated successfully!');
      } else if (selectedTool.id === 8) { // AI Video Generator
        let operation = await currentAi.models.generateVideos({
          model: 'veo-3.1-lite-generate-preview',
          prompt: studioInput,
          config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9'
          }
        });

        while (!operation.done) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          operation = await currentAi.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
          const response = await fetch(downloadLink, {
            method: 'GET',
            headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY || '' },
          });
          const blob = await response.blob();
          setStudioVideo(URL.createObjectURL(blob));
          setStudioOutput('Video generated successfully!');
        }
      } else if (selectedTool.id === 9) { // AI Music Composer
        const response = await currentAi.models.generateContentStream({
          model: "lyria-3-clip-preview",
          contents: `Generate a 30-second background track for a video about: ${studioInput}`,
        });

        let audioBase64 = "";
        let mimeType = "audio/wav";

        for await (const chunk of response) {
          const parts = (chunk as any).candidates?.[0]?.content?.parts;
          if (!parts) continue;
          for (const part of parts) {
            if (part.inlineData?.data) {
              if (!audioBase64 && part.inlineData.mimeType) {
                mimeType = part.inlineData.mimeType;
              }
              audioBase64 += part.inlineData.data;
            }
          }
        }

        if (audioBase64) {
          const binary = atob(audioBase64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: mimeType });
          setStudioAudio(URL.createObjectURL(blob));
          setStudioOutput('Music generated successfully!');
        }
      } else if (selectedTool.id === 10) { // AI Voiceover
        const response = await currentAi.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: `Say clearly and professionally: ${studioInput}` }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
            },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          const binary = atob(base64Audio);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'audio/wav' });
          setStudioAudio(URL.createObjectURL(blob));
          setStudioOutput('Voiceover generated successfully!');
        }
      } else {
        let systemInstruction = "";
        switch (selectedTool.id) {
          case 1: // Script Generator
            systemInstruction = "You are an expert YouTube scriptwriter. Create a detailed script with hooks, intro, main content, and outro based on the user's topic.";
            break;
          case 2: // Viral Predictor
            systemInstruction = "You are a social media trend analyst. Analyze the user's video idea and predict its viral potential. Provide a score out of 100 and suggestions for improvement.";
            break;
          case 3: // Caption AI
            systemInstruction = "You are a social media copywriter. Create 5 engaging captions with relevant hashtags for Instagram, TikTok, and X based on the user's content description.";
            break;
          case 5: // AI Translator
            systemInstruction = "You are a professional translator. Translate the user's text into English, Spanish, French, and Japanese, maintaining the original tone and context.";
            break;
          case 6: // Contract Guard
            systemInstruction = "You are a legal expert specializing in creator contracts. Provide a professional, detailed analysis of the contract risks and negotiation strategies based on the provided text.";
            break;
          case 7: // Shadowban Monitor
            systemInstruction = "You are a social media algorithm expert. Analyze the provided reach data for anomalies that might indicate a shadowban or algorithm suppression. Provide a clear verdict and recovery steps.";
            break;
        }

        const response = await currentAi.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: studioInput,
          config: {
            systemInstruction,
          },
        });

        setStudioOutput(response.text || '');
      }
    } catch (error: any) {
      console.error("Studio Tool Error:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setStudioLoading(false);
    }
  };

  const handleAnalyseContract = async (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return;
    
    toast.loading(`Analyzing contract with ${contract.brand}...`, { id: 'contract' });
    
    try {
      const currentAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await currentAi.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this creator contract summary for risks: ${contract.summary}. Risks already identified: ${contract.risks.join(', ')}. Provide a more detailed breakdown of potential pitfalls and suggestions for negotiation.`,
        config: {
          systemInstruction: "You are a legal expert specializing in creator contracts. Provide a professional, detailed analysis of the contract risks and negotiation strategies.",
        },
      });

      setStudioOutput(response.text || 'Analysis failed.');
      setActiveView('studio');
      setSelectedTool(studioTools.find(t => t.id === 6) || studioTools[0]); // Contract Guard tool
      toast.success("Analysis Complete!", { id: 'contract' });
    } catch (error: any) {
      console.error("Contract Analysis Error:", error);
      toast.error(`Error: ${error.message}`, { id: 'contract' });
    }
  };

  const handleCheckShadowban = async () => {
    toast.loading("Running deep reach analysis...", { id: 'shadowban' });
    
    try {
      const currentAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await currentAi.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this reach trend for potential shadowbans: ${JSON.stringify(shadowbanData.reachTrend)}. Status is currently: ${shadowbanData.status}.`,
        config: {
          systemInstruction: "You are a social media algorithm expert. Analyze the reach data for anomalies that might indicate a shadowban or algorithm suppression. Provide a clear verdict and recovery steps if needed.",
        },
      });

      setStudioOutput(response.text || 'Analysis failed.');
      setActiveView('studio');
      setSelectedTool(studioTools.find(t => t.id === 7) || studioTools[0]); // Shadowban Monitor tool
      toast.success("Analysis Complete!", { id: 'shadowban' });
    } catch (error: any) {
      console.error("Shadowban Analysis Error:", error);
      toast.error(`Error: ${error.message}`, { id: 'shadowban' });
    }
  };

  const handleBiometricSign = async (fileId: string) => {
    toast.info("Initializing biometric signature...");
    
    try {
      const res = await fetch('/api/creator/biometric/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(`Signed successfully! Signature: ${data.signature}`);
      }
    } catch (error: any) {
      console.error("Biometric Signing Error:", error);
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleAiAsk = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      if (!ai) throw new Error(t('cb.dashboard.ai_not_initialized'));
      const result: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: aiPrompt,
        config: {
          systemInstruction: "You are a helpful assistant for creators on the CreatorBook platform. Provide concise and useful advice."
        }
      });
      setAiResponse(result.text || t('cb.dashboard.ai_no_response'));
    } catch (error: any) {
      console.error("AI Error:", error);
      setAiResponse(`${t('cb.dashboard.ai_error')}${error.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAnalyzePost = async (post: any) => {
    setAnalyzingPost(post);
    setShowAnalysisModal(true);
    setIsAnalyzing(true);
    setAnalysisResult('');

    try {
      const currentAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await currentAi.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this post content for engagement, virality, and SEO optimization:\n\n"${post.content}"`,
        config: {
          systemInstruction: "You are a social media strategist. Provide a detailed analysis of the post content, including specific suggestions for increasing engagement, improving virality potential, and optimizing for SEO (hashtags, keywords). Format the output with clear headings.",
        },
      });

      setAnalysisResult(response.text || 'No analysis available.');
    } catch (error: any) {
      console.error("Analysis Error:", error);
      setAnalysisResult(`Error: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'posts'));

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setMessages([]);
      return;
    }
    const q = isAdmin() 
      ? query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(50))
      : query(
          collection(db, 'messages'), 
          or(
            where('senderId', '==', user.uid),
            where('receiverId', '==', user.uid)
          ),
          orderBy('createdAt', 'desc'), 
          limit(50)
        );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'messages'));

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const q = query(collection(db, 'groups'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const groupsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGroups(groupsData);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'groups'));

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    const q = query(
      collection(db, 'notifications'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notifs);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'notifications'));

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setVaultItems([]);
      return;
    }
    const q = query(
      collection(db, 'vault'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VaultItem[];
      setVaultItems(items);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'vault'));

    return () => unsubscribe();
  }, [user]);

  const seedDemoData = async () => {
    if (!user || !isAdmin()) return;
    try {
      // Seed Groups
      const groupsToSeed = [
        { name: 'Tech Creators EU', members: '1.2k', image: 'https://picsum.photos/seed/techgroup/200/200', description: 'Discussion about latest tech and gadgets in Europe.', createdAt: Timestamp.now() },
        { name: 'AI Artists', members: '850', image: 'https://picsum.photos/seed/aigroup/200/200', description: 'Sharing AI-generated art and techniques.', createdAt: Timestamp.now() },
        { name: 'Vloggers United', members: '3.4k', image: 'https://picsum.photos/seed/vloggroup/200/200', description: 'Tips and tricks for daily vlogging.', createdAt: Timestamp.now() },
      ];

      for (const group of groupsToSeed) {
        await addDoc(collection(db, 'groups'), group);
      }

      // Seed Notifications for current user
      const notifsToSeed = [
        { userId: user.uid, user: 'MrBeast', type: 'like', time: '2m ago', avatar: 'https://picsum.photos/seed/beast/100/100', createdAt: Timestamp.now() },
        { userId: user.uid, user: 'MKBHD', type: 'comment', time: '15m ago', avatar: 'https://picsum.photos/seed/mkbhd/100/100', createdAt: Timestamp.now() },
        { userId: user.uid, user: 'Sarah Miller', type: 'follow', time: '1h ago', avatar: 'https://picsum.photos/seed/sarah/100/100', createdAt: Timestamp.now() },
      ];

      for (const notif of notifsToSeed) {
        await addDoc(collection(db, 'notifications'), notif);
      }

      alert('Demo data seeded successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'seed');
    }
  };

  const isAdmin = () => {
    return user?.email === 'realsyncdynamics@gmail.com';
  };

  const handleVaultUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // File size limit: 50MB
    if (file.size > 50 * 1024 * 1024) {
      toast.error(t('cb.vault.error.size') || 'File too large (max 50MB)');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const storageRef = ref(storage, `vault/${user.uid}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        }, 
        (error) => {
          console.error("Upload error:", error);
          toast.error(t('cb.vault.error.upload') || 'Upload failed. Please try again.');
          setIsUploading(false);
          setUploadProgress(0);
        }, 
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Check if a manifest is already provided (mock check, in reality would use c2pa-js to read from file)
            const hasExistingManifest = file.name.includes('c2pa-signed');
            
            let finalManifest = '';
            if (hasExistingManifest) {
              finalManifest = JSON.stringify({
                claim_generator: "External Tool",
                assertions: [{ label: "c2pa.signature", data: { issuer: "External Authority" } }]
              });
            } else {
              // Generate a mock C2PA manifest for the uploaded file
              finalManifest = JSON.stringify({
                claim_generator: "RealSyncDynamics Vault v1.0",
                assertions: [
                  {
                    label: "c2pa.actions",
                    data: {
                      actions: [
                        {
                          action: "c2pa.created",
                          parameters: {
                            name: file.name
                          }
                        }
                      ]
                    }
                  },
                  {
                    label: "c2pa.signature",
                    data: {
                      issuer: "RealSyncDynamics Trust Authority",
                      timestamp: new Date().toISOString()
                    }
                  }
                ]
              });
            }

            await addDoc(collection(db, 'vault'), {
              userId: user.uid,
              name: file.name,
              url: downloadURL,
              size: file.size,
              type: file.type,
              c2paManifest: finalManifest,
              createdAt: Timestamp.now()
            });
            toast.success(t('cb.vault.success.upload') || 'File uploaded successfully to your secure vault.');
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, 'vault');
          } finally {
            setIsUploading(false);
            setUploadProgress(0);
          }
        }
      );
    } catch (error: any) {
      console.error("Vault upload error:", error);
      toast.error(error.message || 'An unexpected error occurred during upload.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleManifestUpload = async (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // File size limit for manifest: 1MB
    if (file.size > 1 * 1024 * 1024) {
      toast.error('Manifest file too large (max 1MB)');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const manifestData = event.target?.result as string;
        try {
          // Attempt to parse to ensure it's valid JSON if it's a .json file
          if (file.name.endsWith('.json')) {
            JSON.parse(manifestData);
          }
          
          await updateDoc(doc(db, 'vault', itemId), {
            c2paManifest: manifestData
          });
          toast.success('C2PA manifest updated successfully!');
        } catch (err) {
          toast.error('Invalid JSON manifest file.');
          console.error("Manifest parse error:", err);
        }
      };
      reader.readAsText(file);
    } catch (error: any) {
      console.error("Manifest upload error:", error);
      toast.error(error.message || 'An unexpected error occurred during manifest upload.');
    }
  };

  const handleDeleteVaultItem = async (itemId: string) => {
    if (!window.confirm(t('common.confirm_delete'))) return;
    try {
      await deleteDoc(doc(db, 'vault', itemId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'vault');
    }
  };

  const handleCreatePost = async (overrideContent?: string | React.MouseEvent) => {
    const contentToPost = typeof overrideContent === 'string' ? overrideContent : newPostContent;
    if (!contentToPost.trim() || !user) return;
    setIsPosting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        authorId: user.uid,
        authorName: profile?.name || user.displayName || 'Anonymous',
        authorHandle: profile?.handle || '@user',
        authorAvatar: profile?.avatar || user.photoURL || '',
        authorVerified: profile?.verified || false,
        authorTrustScore: profile?.trustScore || 88,
        authorFollowers: profile?.followers || '0',
    authorSocials: Object.keys(socials).filter(k => socials[k].connected),
    authorSocialLinks: Object.keys(socials).reduce((acc, k) => { 
      if (socials[k].connected && socials[k].link) acc[k] = socials[k].link; 
      return acc; 
    }, {} as any),
    content: contentToPost,
        likes: 0,
        comments: 0,
        shares: 0,
        createdAt: Timestamp.now()
      });
      if (typeof overrideContent !== 'string') setNewPostContent("");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'posts');
    } finally {
      setIsPosting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !user) return;
    try {
      await addDoc(collection(db, 'messages'), {
        senderId: user.uid,
        senderName: profile?.name || user.displayName || 'Anonymous',
        senderAvatar: profile?.avatar || user.photoURL || '',
        receiverId: 'system',
        text: chatMessage,
        read: false,
        createdAt: Timestamp.now()
      });
      setChatMessage("");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'messages');
    }
  };

  const handleFollow = async (targetUserId: string) => {
    if (!user || user.uid === targetUserId) return;
    try {
      const followId = `${user.uid}_${targetUserId}`;
      const followRef = doc(db, 'follows', followId);
      
      // Check if already following
      // In a real app, we'd use a transaction or a cloud function to update counts
      await setDoc(followRef, {
        followerId: user.uid,
        followingId: targetUserId,
        createdAt: Timestamp.now()
      });

      // Update counts (optimistic/simple for now)
      await updateDoc(doc(db, 'users', user.uid), {
        followingCount: increment(1)
      });
      await updateDoc(doc(db, 'users', targetUserId), {
        followersCount: increment(1)
      });

      toast.success("Following!");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'follows');
    }
  };

  const handleReport = async (targetId: string, type: 'post' | 'user', reason: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'reports'), {
        reporterId: user.uid,
        targetId,
        targetType: type,
        reason,
        status: 'pending',
        createdAt: Timestamp.now()
      });
      toast.success("Report submitted. Thank you for keeping the community safe.");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'reports');
    }
  };

  const handleBlock = async (targetUserId: string) => {
    if (!user || user.uid === targetUserId) return;
    try {
      // Add to a 'blocked' subcollection or array
      await updateDoc(doc(db, 'users', user.uid), {
        blockedUsers: arrayUnion(targetUserId)
      });
      toast.success("User blocked.");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'users');
    }
  };

  // ... rest of state ...

  // Mock data for security features
  const [takedowns, setTakedowns] = useState<any[]>([
    { id: '1', videoTitle: 'My Viral Vlog #1', platform: 'YouTube', channel: 'FakeChannel123', matchPercent: 98, status: 'Detected' },
    { id: '2', videoTitle: 'Cooking Tutorial', platform: 'Instagram', channel: 'ReelsStealer', matchPercent: 85, status: 'Takedown Sent' },
  ]);
  const [licenses] = useState<any[]>([
    { id: 1, content: 'Cinematic Drone Shots', type: 'Exclusive', price: '$500', status: 'Active' },
    { id: 2, content: 'Lofi Beat Pack', type: 'Royalty-Free', price: '$50', status: 'Pending' },
  ]);
  const [communityStats] = useState<any>({
    stats: { hateSpeechBlocked: 142, spamFiltered: 890 },
    activeFilters: ['Hate Speech', 'Spam', 'Deepfake Links', 'Scam Keywords']
  });
  const [contracts] = useState<any[]>([
    { id: 1, brand: 'TechGiant Corp', status: 'Safe', score: 92, summary: 'Standard influencer agreement with fair usage rights.', risks: [] },
    { id: 2, brand: 'ShadyApp Ltd', status: 'Risk', score: 45, summary: 'Perpetual usage rights and broad indemnity clauses found.', risks: ['Perpetual Rights', 'Broad Indemnity'] },
  ]);
  const [shadowbanData] = useState<any>({
    status: 'Healthy',
    reachTrend: [
      { date: '1 Mar', actual: 80, expected: 75 },
      { date: '5 Mar', actual: 85, expected: 78 },
      { date: '10 Mar', actual: 70, expected: 82 },
      { date: '15 Mar', actual: 95, expected: 85 },
      { date: '20 Mar', actual: 110, expected: 90 },
      { date: '25 Mar', actual: 105, expected: 95 },
      { date: '30 Mar', actual: 120, expected: 100 },
    ]
  });
  const [insuranceData] = useState<any>({
    provider: 'CreatorGuard Pro',
    coverageLimit: '$1,000,000',
    nextPayment: '15. April 2026',
    legalCases: [
      { id: 1, opponent: 'Copyright Troll Inc.', status: 'Closed', result: 'Won' },
      { id: 2, opponent: 'Music Label X', status: 'In Progress', result: 'Pending' },
    ]
  });

  const [anomalies, setAnomalies] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'anomalies'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const anomaly = { id: change.doc.id, ...change.doc.data() } as any;
          const createdAt = anomaly.createdAt?.toDate();
          // Only show toast for new anomalies (within last 10 seconds)
          if (createdAt && Date.now() - createdAt.getTime() < 10000) {
            toast.error(`Security Alert: ${anomaly.type.replace('_', ' ').toUpperCase()}`, {
              description: anomaly.description,
              duration: 10000,
            });
          }
        }
      });
      const newAnomalies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAnomalies(newAnomalies);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'anomalies');
    });

    return () => unsubscribe();
  }, [user]);

  const handleSimulateAnomaly = async () => {
    if (!user) return;
    const types = ["brute_force", "unusual_traffic", "api_overuse", "deepfake_attempt", "unauthorized_access"];
    const severities = ["low", "medium", "high", "critical"];
    const type = types[Math.floor(Math.random() * types.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    
    try {
      await addDoc(collection(db, 'anomalies'), {
        userId: user.uid,
        type,
        severity,
        description: `AI detected a potential ${type.replace('_', ' ')} attempt from an unknown source.`,
        source: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        status: 'detected',
        confidence: 0.85 + Math.random() * 0.1,
        createdAt: Timestamp.now()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'anomalies');
    }
  };

  const handleC2PAVerify = async (file: File) => {
    try {
      // 1. Verify document
      const verifyRes = await fetch('/api/verify/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type })
      });
      const verifyData = await verifyRes.json();

      // 2. Get provenance history (mocked with a random ID)
      const provenanceRes = await fetch(`/api/verify/provenance/${Math.random().toString(36).substring(7)}`);
      const provenanceData = await provenanceRes.json();

      return {
        ...verifyData,
        ...provenanceData
      };
    } catch (error) {
      console.error("C2PA Verification Error:", error);
      throw error;
    }
  };
  const [socials, setSocials] = useState<any>({
    youtube: { connected: true, handle: '@max_creator', followers: 125000, link: 'https://youtube.com/@max_creator' },
    instagram: { connected: true, handle: 'max.official', followers: 84000, link: 'https://instagram.com/max.official' },
    tiktok: { connected: false, handle: '', followers: 0, link: '' },
    facebook: { connected: false, handle: '', followers: 0, link: '' },
    x: { connected: false, handle: '', followers: 0, link: '' },
  });
  const [trustScore] = useState(88);

  const [studioTools] = useState<any[]>([
    { id: 1, name: t('cb.studio.script_gen.name'), icon: <FileText className="w-5 h-5" />, description: t('cb.studio.script_gen.desc'), status: 'Ready' },
    { id: 2, name: t('cb.studio.viral_predictor.name'), icon: <TrendingUp className="w-5 h-5" />, description: t('cb.studio.viral_predictor.desc'), status: 'Beta' },
    { id: 3, name: t('cb.studio.caption_ai.name'), icon: <MessageSquare className="w-5 h-5" />, description: t('cb.studio.caption_ai.desc'), status: 'Ready' },
    { id: 4, name: t('cb.studio.thumbnail_gen.name'), icon: <Image className="w-5 h-5" />, description: t('cb.studio.thumbnail_gen.desc'), status: 'Ready' },
    { id: 5, name: t('cb.studio.translator.name'), icon: <Globe className="w-5 h-5" />, description: t('cb.studio.translator.desc'), status: 'Ready' },
    { id: 6, name: t('cb.security.contract_guard'), icon: <ShieldCheck className="w-5 h-5" />, description: 'AI-powered contract risk analysis.', status: 'Ready' },
    { id: 7, name: t('cb.security.shadowban'), icon: <Activity className="w-5 h-5" />, description: 'Deep reach and algorithm analysis.', status: 'Ready' },
    { id: 8, name: 'AI Video Generator', icon: <Video className="w-5 h-5" />, description: 'Generate high-quality video clips from text.', status: 'New' },
    { id: 9, name: 'AI Music Composer', icon: <Music className="w-5 h-5" />, description: 'Create original background music for your content.', status: 'New' },
    { id: 10, name: 'AI Voiceover', icon: <Mic className="w-5 h-5" />, description: 'Professional text-to-speech voiceovers.', status: 'New' },
  ]);

  const [automationFlows] = useState<any[]>([
    { id: 1, name: t('cb.automation.sync.name'), trigger: t('cb.automation.sync.trigger'), action: t('cb.automation.sync.action'), status: 'Active' },
    { id: 2, name: t('cb.automation.guard.name'), trigger: t('cb.automation.guard.trigger'), action: t('cb.automation.guard.action'), status: 'Active' },
    { id: 3, name: t('cb.automation.license.name'), trigger: t('cb.automation.license.trigger'), action: t('cb.automation.license.action'), status: 'Inactive' },
  ]);

  const [stories] = useState([
    { id: 1, name: 'Your Story', avatar: 'https://picsum.photos/seed/max/100/100', isUser: true },
    { id: 2, name: 'MrBeast', avatar: 'https://picsum.photos/seed/beast/100/100', active: true },
    { id: 3, name: 'MKBHD', avatar: 'https://picsum.photos/seed/mkbhd/100/100', active: true },
    { id: 4, name: 'Casey', avatar: 'https://picsum.photos/seed/casey/100/100', active: true },
    { id: 5, name: 'Sarah', avatar: 'https://picsum.photos/seed/sarah/100/100', active: false },
    { id: 6, name: 'David', avatar: 'https://picsum.photos/seed/david/100/100', active: false },
    { id: 7, name: 'Emma', avatar: 'https://picsum.photos/seed/emma/100/100', active: true },
  ]);

  const [feedPosts] = useState([
    {
      id: 1,
      author: {
        name: 'MrBeast',
        handle: '@mrbeast',
        avatar: 'https://picsum.photos/seed/beast/100/100',
        trustScore: 98,
        followers: '240M',
        verified: true,
        socials: ['youtube', 'instagram', 'x'],
        socialLinks: {
          youtube: 'https://youtube.com/@mrbeast',
          instagram: 'https://instagram.com/mrbeast',
          x: 'https://x.com/mrbeast'
        }
      },
      content: 'Just finished the biggest video yet! We gave away a private island to a random subscriber. Can\'t wait for you guys to see it. 🚀',
      image: 'https://picsum.photos/seed/beastpost/800/450',
      likes: '1.2M',
      comments: '45k',
      shares: '12k',
      time: '2h ago'
    },
    {
      id: 2,
      author: {
        name: 'MKBHD',
        handle: '@mkbhd',
        avatar: 'https://picsum.photos/seed/mkbhd/100/100',
        trustScore: 95,
        followers: '18M',
        verified: true,
        socials: ['youtube', 'x', 'instagram'],
        socialLinks: {
          youtube: 'https://youtube.com/@mkbhd',
          instagram: 'https://instagram.com/mkbhd',
          x: 'https://x.com/mkbhd'
        }
      },
      content: 'The new AI features in CreatorBook are actually insane. The Viral Predictor just saved me 10 hours of research. Review coming soon.',
      videoThumbnail: 'https://picsum.photos/seed/mkbhdvid/800/450',
      likes: '85k',
      comments: '1.2k',
      shares: '800',
      time: '4h ago'
    },
    {
      id: 3,
      author: {
        name: 'Sarah Miller',
        handle: '@sarah_creates',
        avatar: 'https://picsum.photos/seed/sarah/100/100',
        trustScore: 89,
        followers: '520k',
        verified: true,
        socials: ['instagram', 'tiktok'],
        socialLinks: {
          instagram: 'https://instagram.com/sarah_creates',
          tiktok: 'https://tiktok.com/@sarah_creates'
        }
      },
      content: 'Morning routine in the studio. New automation flows are keeping my sanity intact today! ✨',
      image: 'https://picsum.photos/seed/studio/800/1000',
      likes: '12k',
      comments: '342',
      shares: '156',
      time: '6h ago'
    }
  ]);

  const handleTakedown = async (id: string) => {
    const tk = takedowns.find(t => t.id === id);
    if (!tk) return;
    
    toast.loading(t('cb.security.takedown_loading') || 'Initiating takedown process...', { id: 'takedown' });
    
    try {
      const currentAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await currentAi.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a formal DMCA takedown notice for the following content:\nTitle: ${tk.videoTitle}\nPlatform: ${tk.platform}\nChannel: ${tk.channel}\nMatch: ${tk.matchPercent}%`,
        config: {
          systemInstruction: "You are a legal assistant specializing in digital copyright. Generate a professional and legally sound DMCA notice."
        }
      });

      console.log("Generated Takedown Notice:", response.text);
      
      setTakedowns(prev => prev.map(t => t.id === id ? { ...t, status: 'Sent' } : t));
      toast.success(t('cb.security.takedown_success') || 'Takedown notice sent successfully!', { id: 'takedown' });
    } catch (error: any) {
      console.error("Takedown Error:", error);
      toast.error(`Error: ${error.message}`, { id: 'takedown' });
    }
  };

  const handleSocialConnect = (platform: string) => {
    setSocials({
      ...socials,
      [platform]: { connected: true, handle: 'max_connected', followers: 1200 }
    });
  };

  const handleSocialDisconnect = (platform: string) => {
    setSocials({
      ...socials,
      [platform]: { connected: false, handle: '', followers: 0 }
    });
  };

  const handleSync = () => {
    if (!syncContent) return;
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncContent("");
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex bg-[#050510] text-white font-['Space_Grotesk'] overflow-hidden"
    >
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 h-full bg-[#0a0a1a]/80 backdrop-blur-2xl border-r border-white/5 flex flex-col p-4 z-50">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0099cc] flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.3)]">
            <Video className="w-5 h-5 text-black" />
          </div>
          <span className="hidden lg:block font-['Fraunces'] font-black text-lg tracking-tight">CreatorBook</span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavButton 
            active={activeView === 'dashboard'} 
            onClick={() => setActiveView('dashboard')} 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label={t('cb.sidebar.home')} 
            status="available"
          />
          <NavButton 
            active={activeView === 'community'} 
            onClick={() => {
              setActiveView('community');
              setSelectedGroup(null);
            }} 
            icon={<Users className="w-5 h-5" />} 
            label={t('cb.sidebar.community')} 
            status="available"
          />
          <NavButton 
            active={activeView === 'market'} 
            onClick={() => setActiveView('market')} 
            icon={<ShoppingBag className="w-5 h-5" />} 
            label="Market" 
            status="available"
          />
          <NavButton 
            active={activeView === 'inquiries'} 
            onClick={() => setActiveView('inquiries')} 
            icon={<Mail className="w-5 h-5" />} 
            label="Inquiries" 
            status="available"
          />
          <NavButton 
            active={activeView === 'bookings'} 
            onClick={() => setActiveView('bookings')} 
            icon={<FileText className="w-5 h-5" />} 
            label="Bookings" 
            status="available"
          />
          <NavButton 
            active={activeView === 'groups'} 
            onClick={() => setActiveView('groups')} 
            icon={<Hash className="w-5 h-5" />} 
            label={t('cb.sidebar.groups')} 
            status="available"
          />
          <NavButton 
            active={activeView === 'messages'} 
            onClick={() => setActiveView('messages')} 
            icon={<MessageSquare className="w-5 h-5" />} 
            label={t('cb.sidebar.messages')} 
            status="available"
          />
          <NavButton 
            active={activeView === 'notifications'} 
            onClick={() => setActiveView('notifications')} 
            icon={<Bell className="w-5 h-5" />} 
            label={t('cb.sidebar.notifications')} 
            status="available"
          />
          <NavButton 
            active={activeView === 'studio'} 
            onClick={() => setActiveView('studio')} 
            icon={<Video className="w-5 h-5" />} 
            label={t('cb.sidebar.tools')} 
            status="beta"
          />
          <NavButton 
            active={activeView === 'automation'} 
            onClick={() => setActiveView('automation')} 
            icon={<Workflow className="w-5 h-5" />} 
            label="Automations" 
            status="beta"
          />
          <NavButton 
            active={activeView === 'vault'} 
            onClick={() => setActiveView('vault')} 
            icon={<Lock className="w-5 h-5" />} 
            label={t('cb.dashboard.creator_vault') || 'Creator Vault'} 
            status="available"
          />
          <NavButton 
            active={activeView === 'c2pa'} 
            onClick={() => setActiveView('c2pa')} 
            icon={<ShieldCheck className="w-5 h-5" />} 
            label="C2PA Verify" 
            status="available"
          />
          <NavButton 
            active={activeView === 'security'} 
            onClick={() => setActiveView('security')} 
            icon={<Shield className="w-5 h-5" />} 
            label={t('cb.sidebar.security')} 
            status="planned"
          />
          <div className="h-px bg-white/5 mx-2 my-4" />
          <NavButton 
            active={activeView === 'legal'} 
            onClick={() => setActiveView('legal')} 
            icon={<ShieldCheck className="w-5 h-5" />} 
            label="Legal & Trust" 
            status="available"
          />
          <div className="h-px bg-white/5 mx-2 my-4" />
          <NavButton 
            active={activeView === 'wallet'} 
            onClick={() => setActiveView('wallet')} 
            icon={<Wallet className="w-5 h-5" />} 
            label="Wallet" 
            status="available"
          />
        </nav>

        <div className="mt-auto space-y-2">
          <button 
            onClick={() => setActiveView('settings')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeView === 'settings' ? 'text-white bg-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
          >
            <Settings className="w-5 h-5" />
            <span className="hidden lg:block text-sm font-bold">{t('cb.sidebar.settings')}</span>
          </button>
          <div className="p-4 bg-gradient-to-br from-[#00d4ff]/10 to-transparent rounded-2xl border border-[#00d4ff]/20 hidden lg:block">
            <div className="text-[10px] font-bold text-[#00d4ff] uppercase tracking-widest mb-1">
              {profile?.plan ? t(`pricing.${profile.plan}.name`) : 'Bronze'} {t('cb.sidebar.plan')}
            </div>
            <div className="text-xs font-bold mb-3">{t('cb.sidebar.unlimited')}</div>
            <button 
              onClick={() => setActiveView('pricing')}
              className="w-full py-2 bg-[#00d4ff] text-black text-[10px] font-black rounded-lg uppercase tracking-widest"
            >
              {t('cb.sidebar.upgrade')}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto relative">
        {/* Background Effects */}
        <div className="absolute top-0 inset-x-0 h-full bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(0,212,255,0.08),transparent_60%)] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-8 py-8 relative z-10">
          {/* Header */}
          <header className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-2xl font-['Fraunces'] font-black capitalize">{activeView}</h1>
              <p className="text-sm text-white/40 font-medium">{t('cb.header.welcome')}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input 
                  type="text" 
                  placeholder={t('cb.header.search')} 
                  className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#00d4ff]/40 w-64"
                />
              </div>
              <div className="flex items-center gap-3">
                <button 
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all relative ${activeView === 'notifications' ? 'bg-[#00d4ff] border-[#00d4ff] text-black' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
                  onClick={() => setActiveView('notifications')}
                >
                  <Bell className="w-5 h-5" />
                  <span className={`absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-[#050510] ${activeView === 'notifications' ? 'bg-black' : 'bg-[#00d4ff]'}`} />
                </button>
                <button 
                  onClick={() => setActiveView('messages')}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className={`absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-[#050510] ${activeView === 'messages' ? 'bg-black' : 'bg-purple-500'}`} />
                </button>
                <button 
                  onClick={() => setShowTopUpModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white text-xs font-bold rounded-xl hover:bg-white/10 transition-all"
                >
                  <span className="text-[#00d4ff]">€</span> {profile?.balance ? profile.balance.toFixed(2) : '0.00'}
                </button>
                <button 
                  onClick={handleCreatePost}
                  disabled={isPosting || !newPostContent.trim()}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#00d4ff] to-purple-500 text-black text-xs font-black rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.2)] hover:scale-105 transition-transform disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> {isPosting ? '...' : t('cb.header.new_post')}
                </button>
                <button 
                  onClick={() => setActiveView('profile')}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-[1px] hover:scale-110 transition-transform"
                >
                  <div className="w-full h-full rounded-[11px] bg-[#050510] flex items-center justify-center overflow-hidden">
                    <img src={profile?.avatar || user?.photoURL || "https://picsum.photos/seed/max/100/100"} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                </button>
              </div>
            </div>
          </header>

        {activeView === 'dashboard' && (
          <div className="space-y-8">
            <TrustScore score={profile?.trustScore || trustScore} />
            <Dashboard 
              stories={stories}
              feedPosts={posts}
              onFollow={handleFollow}
              onReport={handleReport}
              onBlock={handleBlock}
              onPost={handleCreatePost}
              onAnalyze={handleAnalyzePost}
            />
          </div>
        )}

        {activeView === 'marketplace' && !selectedCreator && (
          <Discovery 
            creators={marketCreators}
            onSelectCreator={setSelectedCreator}
            search={marketSearch}
            onSearchChange={setMarketSearch}
            category={marketCategory}
            onCategoryChange={setMarketCategory}
            verifiedOnly={marketVerifiedOnly}
            onVerifiedOnlyChange={setMarketVerifiedOnly}
            minFollowers={marketMinFollowers}
            onMinFollowersChange={setMarketMinFollowers}
            language={marketLanguage}
            onLanguageChange={setMarketLanguage}
            country={marketCountry}
            onCountryChange={setMarketCountry}
            platform={marketPlatform}
            onPlatformChange={setMarketPlatform}
            sortBy={marketSortBy}
            onSortByChange={setMarketSortBy}
            showFilters={showMarketFilters}
            onShowFiltersChange={setShowMarketFilters}
          />
        )}

        {activeView === 'marketplace' && selectedCreator && (
          <div className="space-y-8">
            <TrustScore score={selectedCreator.trustScore || 50} />
            <CreatorProfile 
              creator={selectedCreator}
              posts={posts.filter(p => p.authorId === selectedCreator.id)}
              onBack={() => setSelectedCreator(null)}
              onInquiry={(c) => { setSelectedCreator(c); setShowInquiryModal(true); }}
              onBooking={handleBooking}
            />
          </div>
        )}

        {activeView === 'community' && (
          <div className="space-y-8">
            <TrustScore score={profile?.trustScore || trustScore} />
            <Dashboard 
              stories={stories}
              feedPosts={posts}
              onFollow={handleFollow}
              onReport={handleReport}
              onBlock={handleBlock}
              onPost={handleCreatePost}
              onAnalyze={handleAnalyzePost}
            />
          </div>
        )}

        {activeView === 'groups' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black font-['Fraunces']">{t('cb.sidebar.groups')}</h2>
              <button 
                onClick={() => setShowGroupModal(true)}
                className="px-6 py-2.5 bg-[#00d4ff] text-black font-black rounded-xl hover:scale-105 transition-transform"
              >
                + {t('cb.community.groups_title')}
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {groups.map(group => (
                <motion.div 
                  key={group.id}
                  whileHover={{ y: -5 }}
                  className="bg-white/[0.03] border border-white/10 rounded-[32px] overflow-hidden group cursor-pointer"
                  onClick={() => {
                    setSelectedGroup(group);
                    setActiveView('community');
                  }}
                >
                  <div className="h-32 relative overflow-hidden">
                    <img src={group.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={group.name} referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050510] to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-1">{group.name}</h3>
                    <p className="text-xs text-white/40 mb-4">{group.members} {t('cb.community.members')}</p>
                    <p className="text-sm text-white/60 line-clamp-2">{group.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'studio' && (
          <div className="space-y-8">
            {selectedTool ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 backdrop-blur-md"
              >
                <button 
                  onClick={() => {
                    setSelectedTool(null);
                    setStudioInput('');
                    setStudioOutput('');
                    setStudioImage(null);
                  }}
                  className="mb-6 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#00d4ff] flex items-center gap-2 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> {t('cb.studio.back')}
                </button>
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00d4ff]/20 to-transparent flex items-center justify-center text-[#00d4ff]">
                    {selectedTool.icon}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black font-['Fraunces']">{selectedTool.name}</h2>
                    <p className="text-white/60 mt-1">{selectedTool.description}</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t('cb.studio.input_label') || 'Input'}</label>
                      <textarea 
                        value={studioInput}
                        onChange={(e) => setStudioInput(e.target.value)}
                        placeholder={t('cb.studio.input_placeholder') || 'Enter your topic or content here...'}
                        className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#00d4ff]/40 transition-colors resize-none"
                      />
                    </div>
                    <button 
                      onClick={handleStudioToolAction}
                      disabled={studioLoading || !studioInput}
                      className="w-full py-4 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#0099cc] text-[#060612] font-bold text-sm shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {studioLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          {t('cb.studio.generating') || 'Generating...'}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          {t('cb.studio.generate_btn') || 'Generate with AI'}
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t('cb.studio.output_label') || 'Output'}</label>
                      <div className="w-full h-64 bg-black/20 border border-white/10 rounded-2xl p-4 overflow-y-auto">
                        {studioLoading ? (
                          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-12 h-12 rounded-full border-2 border-[#00d4ff]/20 border-t-[#00d4ff] animate-spin" />
                            <p className="text-xs text-white/40">{t('cb.studio.processing_desc') || 'Our AI is crafting your content...'}</p>
                          </div>
                        ) : studioImage ? (
                          <div className="space-y-4">
                            <img src={studioImage} alt="Generated Thumbnail" className="w-full rounded-xl border border-white/10 shadow-lg" referrerPolicy="no-referrer" />
                            <a 
                              href={studioImage} 
                              download="thumbnail.png"
                              className="flex items-center justify-center gap-2 text-xs font-bold text-[#00d4ff] hover:underline"
                            >
                              <Download className="w-4 h-4" /> {t('cb.studio.download') || 'Download Image'}
                            </a>
                          </div>
                        ) : studioVideo ? (
                          <div className="space-y-4">
                            <video src={studioVideo} controls className="w-full rounded-xl border border-white/10 shadow-lg" />
                            <a 
                              href={studioVideo} 
                              download="generated_video.mp4"
                              className="flex items-center justify-center gap-2 text-xs font-bold text-[#00d4ff] hover:underline"
                            >
                              <Download className="w-4 h-4" /> Download Video
                            </a>
                          </div>
                        ) : studioAudio ? (
                          <div className="space-y-4 h-full flex flex-col items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 mb-4">
                              <Music className="w-10 h-10" />
                            </div>
                            <audio src={studioAudio} controls className="w-full" />
                            <a 
                              href={studioAudio} 
                              download="generated_audio.wav"
                              className="flex items-center justify-center gap-2 text-xs font-bold text-[#00d4ff] hover:underline mt-4"
                            >
                              <Download className="w-4 h-4" /> Download Audio
                            </a>
                          </div>
                        ) : studioOutput ? (
                          <div className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                            {studioOutput}
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center text-white/20">
                            <Sparkles className="w-8 h-8 mb-2" />
                            <p className="text-xs">{t('cb.studio.waiting_desc') || 'Generated content will appear here'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {studioTools.map(tool => (
                  <motion.div 
                    key={tool.id}
                    whileHover={{ y: -5 }}
                    onClick={() => setSelectedTool(tool)}
                    className="p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 group cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00d4ff]/20 to-transparent flex items-center justify-center text-[#00d4ff] group-hover:scale-110 transition-transform">
                        {tool.icon}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${tool.status === 'Ready' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {tool.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{tool.name}</h3>
                    <p className="text-sm text-white/60 leading-relaxed">{tool.description}</p>
                    <button className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                      {t('cb.studio.launch')} <ChevronRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeView === 'automation' && (
          <Automations 
            workflows={workflows}
            webhooks={webhooks}
            onToggleWorkflow={handleToggleWorkflow}
            onDeleteWorkflow={handleDeleteWorkflow}
            onToggleWebhook={handleToggleWebhook}
            onDeleteWebhook={handleDeleteWebhook}
            onCreateWorkflow={handleCreateWorkflow}
            onCreateWebhook={handleCreateWebhook}
            onCreatePost={(content) => handleCreatePost(content)}
          />
        )}

        {activeView === 'vault' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black font-['Fraunces']">{t('cb.dashboard.creator_vault') || 'Creator Vault'}</h2>
                <p className="text-white/60 text-sm mt-1">{t('cb.dashboard.vault_desc') || 'Secure your master files in our encrypted vault with blockchain timestamps.'}</p>
              </div>
              <div className="relative">
                <input 
                  type="file" 
                  id="vault-upload" 
                  className="hidden" 
                  onChange={handleVaultUpload}
                  disabled={isUploading}
                />
                <label 
                  htmlFor="vault-upload"
                  className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${isUploading ? 'bg-white/10 text-white/40' : 'bg-[#00d4ff] text-black hover:scale-105'}`}
                >
                  {isUploading ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> {Math.round(uploadProgress)}%</>
                  ) : (
                    <><Upload className="w-4 h-4" /> Upload File</>
                  )}
                </label>
                {isUploading && (
                  <div className="absolute top-full left-0 right-0 mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="h-full bg-[#00d4ff]"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vaultItems.map(item => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/[0.03] border border-white/10 rounded-[32px] p-6 group relative overflow-hidden"
                >
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                      onClick={() => handleDeleteVaultItem(item.id)}
                      className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00d4ff]/20 to-purple-500/20 flex items-center justify-center mb-6 text-[#00d4ff]">
                    {item.type?.includes('image') ? <Image className="w-8 h-8" /> : 
                     item.type?.includes('video') ? <Video className="w-8 h-8" /> : 
                     <File className="w-8 h-8" />}
                  </div>
                  
                  <h3 className="text-lg font-bold mb-1 truncate pr-10">{item.name}</h3>
                  <div className="flex items-center gap-4 text-xs text-white/40 mb-6">
                    <span>{(item.size / 1024 / 1024).toFixed(2)} MB</span>
                    <span>•</span>
                    <span>{new Date(item.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}</span>
                  </div>

                  {item.c2paManifest && (
                    <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 text-[#00d4ff] text-xs font-bold mb-2 uppercase tracking-widest">
                        <ShieldCheck className="w-4 h-4" /> C2PA Authenticated
                      </div>
                      <div className="text-[10px] text-white/60 font-mono break-all line-clamp-3">
                        {item.c2paManifest}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <a 
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Download
                    </a>
                    <label className="py-3 rounded-xl bg-[#00d4ff]/10 hover:bg-[#00d4ff]/20 text-[#00d4ff] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer">
                      <Upload className="w-4 h-4" /> Manifest
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".json,.c2pa"
                        onChange={(e) => handleManifestUpload(item.id, e)}
                      />
                    </label>
                  </div>
                </motion.div>
              ))}
              
              {vaultItems.length === 0 && (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-[32px]">
                  <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6 text-white/20">
                    <Lock className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Vault is empty</h3>
                  <p className="text-white/40 text-sm">Upload your first file to secure it with C2PA provenance.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'messages' && (
          <MessagesView 
            messages={messages}
            onSendMessage={handleSendMessage}
            currentUser={user}
          />
        )}

        {activeView === 'notifications' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-8">{t('cb.notifications.title')}</h3>
            {notifications.map(notif => (
              <motion.div 
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex items-center gap-5 hover:bg-white/5 transition-all cursor-pointer group"
              >
                <div className="relative">
                  <img src={notif.avatar} className="w-12 h-12 rounded-2xl border border-white/10 object-cover" alt={notif.user} referrerPolicy="no-referrer" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#00d4ff] rounded-lg border-2 border-[#050510] flex items-center justify-center">
                    {notif.type === 'like' && <Zap className="w-3 h-3 text-black" />}
                    {notif.type === 'comment' && <MessageSquare className="w-3 h-3 text-black" />}
                    {notif.type === 'follow' && <Users className="w-3 h-3 text-black" />}
                    {notif.type === 'collab' && <Activity className="w-3 h-3 text-black" />}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-black">{notif.user}</span>{' '}
                    <span className="text-white/60">
                      {notif.type === 'like' && t('cb.notifications.like')}
                      {notif.type === 'comment' && t('cb.notifications.comment')}
                      {notif.type === 'follow' && t('cb.notifications.follow')}
                      {notif.type === 'collab' && t('cb.notifications.collab')}
                    </span>
                  </p>
                  <p className="text-[10px] font-bold text-white/20 mt-1 uppercase tracking-widest">
                    {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleString() : notif.time}
                  </p>
                </div>
                <div className="w-2 h-2 bg-[#00d4ff] rounded-full shadow-[0_0_10px_rgba(0,212,255,0.5)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        )}

        {activeView === 'c2pa' && (
          <C2PAVerification onVerify={handleC2PAVerify} />
        )}

        {activeView === 'security' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[32px] shadow-sm backdrop-blur-md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">AI Security Alerts</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSimulateAnomaly}
                      className="p-2 rounded-lg bg-[#00d4ff]/10 text-[#00d4ff] hover:bg-[#00d4ff]/20 transition-all"
                      title="Simulate Anomaly"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
                  {anomalies.length === 0 ? (
                    <div className="text-center py-8 text-white/20">
                      <ShieldCheck className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p className="text-xs font-bold uppercase tracking-widest">No anomalies detected</p>
                    </div>
                  ) : (
                    anomalies.map((anomaly) => (
                      <div key={anomaly.id} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="text-xs font-bold text-white uppercase tracking-wider">{anomaly.type.replace('_', ' ')}</div>
                            <div className="text-[10px] text-white/40">{anomaly.createdAt?.toDate?.().toLocaleString()}</div>
                          </div>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${
                            anomaly.severity === 'critical' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                            anomaly.severity === 'high' ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' :
                            anomaly.severity === 'medium' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' :
                            'bg-blue-500/20 text-blue-500 border-blue-500/30'
                          }`}>
                            {anomaly.severity}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/60 leading-relaxed mb-3">{anomaly.description}</p>
                        <div className="flex items-center justify-between text-[9px] font-bold">
                          <div className="text-white/40">Source: <span className="text-white/60">{anomaly.source}</span></div>
                          <div className="text-[#00d4ff]">AI Confidence: {(anomaly.confidence * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[32px] shadow-sm backdrop-blur-md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">{t('cb.security.takedowns')}</h3>
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                </div>
                <div className="space-y-4">
                  {takedowns.map((tk) => (
                    <div key={tk.id} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-xs font-bold truncate max-w-[180px] text-white">{tk.videoTitle}</div>
                          <div className="text-[10px] text-white/40">{tk.platform} · {tk.channel}</div>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${tk.status === 'Detected' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                          {tk.status === 'Detected' ? t('cb.security.status.detected') : t('cb.security.status.sent')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-[10px] font-bold text-[#00d4ff]">{tk.matchPercent}% {t('cb.security.match')}</div>
                        <button 
                          onClick={() => handleTakedown(tk.id)}
                          className="px-3 py-1 rounded-lg bg-white text-black text-[10px] font-bold hover:bg-[#00d4ff] transition-all"
                        >
                          {t('cb.security.takedown_btn')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[32px] shadow-sm backdrop-blur-md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">{t('cb.security.licensing')}</h3>
                  <div className="w-8 h-8 rounded-lg bg-[#00d4ff]/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#00d4ff]" />
                  </div>
                </div>
                <div className="space-y-4">
                  {licenses.map((lic) => (
                    <div key={lic.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">{lic.content}</div>
                        <div className="text-[10px] text-white/40">{lic.type} · {lic.price}</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${lic.status === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/10 text-white/40 border border-white/10'}`}>
                        {lic.status === 'Active' ? t('cb.security.status.active') : t('cb.security.status.pending')}
                      </div>
                    </div>
                  ))}
                  <button className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-white/10 text-[10px] font-bold text-white/40 hover:border-[#00d4ff] hover:text-[#00d4ff] transition-all uppercase tracking-widest">
                    {t('cb.security.new_license')}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[32px] shadow-sm backdrop-blur-md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-['Fraunces'] font-black">{t('cb.security.community_defense')}</h3>
                  <button 
                    onClick={() => handleGenerateSecurityVideo(`Community defense report: ${communityStats.stats.hateSpeechBlocked} hate speech blocked, ${communityStats.stats.spamFiltered} spam filtered.`)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#00d4ff] transition-all"
                    title="Generate Explanatory Video"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
                {communityStats && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="text-[9px] text-white/40 uppercase font-bold tracking-widest mb-1">{t('cb.security.blocked_hate')}</div>
                        <div className="text-xl font-bold text-red-500">{communityStats.stats.hateSpeechBlocked}</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="text-[9px] text-white/40 uppercase font-bold tracking-widest mb-1">{t('cb.security.spam_filtered')}</div>
                        <div className="text-xl font-bold text-[#00d4ff]">{communityStats.stats.spamFiltered}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-white/40 uppercase font-bold tracking-widest mb-3">{t('cb.security.active_filters')}</div>
                      <div className="flex flex-wrap gap-2">
                        {communityStats.activeFilters.map((f: string) => (
                          <span key={f} className="px-3 py-1 rounded-lg bg-[#39ff6e]/10 text-[#39ff6e] text-[9px] font-bold border border-[#39ff6e]/20 uppercase tracking-widest">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[32px] shadow-sm backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Lock className="w-32 h-32 text-white" />
                </div>
                <h3 className="text-xl font-['Fraunces'] font-black mb-4 relative z-10">{t('cb.security.biometric')}</h3>
                <p className="text-xs text-white/60 mb-8 leading-relaxed relative z-10">
                  {t('cb.security.biometric_desc')}
                </p>
                <div className="space-y-4 relative z-10">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div className="text-xs font-bold text-white">Final_Cut_v2.mp4</div>
                    <button 
                      onClick={() => handleBiometricSign('vid_1')}
                      className="px-4 py-2 rounded-xl bg-[#00d4ff] text-black text-[10px] font-bold hover:bg-white transition-all shadow-[0_0_15px_rgba(0,212,255,0.2)]"
                    >
                      {t('cb.security.biometric_btn')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {isModerator && (
              <div className="space-y-8 pt-8 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-6 h-6 text-[#00d4ff]" />
                  <h2 className="text-2xl font-black font-['Fraunces']">Moderation <span className="text-[#00d4ff]">Center</span></h2>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6">Pending Reports ({reports.filter(r => r.status === 'pending').length})</h3>
                    <div className="space-y-4">
                      {reports.filter(r => r.status === 'pending').map(report => (
                        <div key={report.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold">Type: <span className="text-[#00d4ff] capitalize">{report.targetType}</span></p>
                              <p className="text-[10px] text-white/40 mt-1">Reason: {report.reason}</p>
                            </div>
                            <span className="text-[8px] text-white/20 uppercase tracking-widest">{report.createdAt?.toDate?.().toLocaleString()}</span>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleUpdateReportStatus(report.id, 'dismissed')}
                              className="flex-1 py-2 rounded-lg bg-white/5 text-[10px] font-bold hover:bg-white/10 transition-all"
                            >
                              Dismiss
                            </button>
                            <button 
                              onClick={() => handleUpdateReportStatus(report.id, 'resolved')}
                              className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-400 text-[10px] font-bold hover:bg-red-500/30 transition-all"
                            >
                              Resolve
                            </button>
                          </div>
                        </div>
                      ))}
                      {reports.filter(r => r.status === 'pending').length === 0 && (
                        <p className="text-center text-white/20 text-xs py-8">No pending reports.</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6">Verification Requests ({verificationRequests.filter(v => v.status === 'pending').length})</h3>
                    <div className="space-y-4">
                      {verificationRequests.filter(v => v.status === 'pending').map(request => (
                        <div key={request.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold">User: <span className="text-[#00d4ff]">{request.userId}</span></p>
                              <p className="text-[10px] text-white/40 mt-1">Level: <span className="capitalize">{request.type}</span></p>
                            </div>
                            <span className="text-[8px] text-white/20 uppercase tracking-widest">{request.createdAt?.toDate?.().toLocaleString()}</span>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleUpdateVerificationStatus(request.id, request.userId, 'rejected', request.type)}
                              className="flex-1 py-2 rounded-lg bg-white/5 text-[10px] font-bold hover:bg-white/10 transition-all"
                            >
                              Reject
                            </button>
                            <button 
                              onClick={() => handleUpdateVerificationStatus(request.id, request.userId, 'approved', request.type)}
                              className="flex-1 py-2 rounded-lg bg-[#00d4ff]/20 text-[#00d4ff] text-[10px] font-bold hover:bg-[#00d4ff]/30 transition-all"
                            >
                              Approve
                            </button>
                          </div>
                        </div>
                      ))}
                      {verificationRequests.filter(v => v.status === 'pending').length === 0 && (
                        <p className="text-center text-white/20 text-xs py-8">No pending requests.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Contract Guard & Shadowban Monitor */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[32px] shadow-sm backdrop-blur-md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-['Fraunces'] font-black">{t('cb.security.contract_guard')}</h3>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
                <div className="space-y-4">
                  {contracts.map((con) => (
                    <div key={con.id} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-bold text-white">{con.brand}</div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${con.status === 'Safe' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                          {con.status === 'Safe' ? t('cb.security.status.safe') : t('cb.security.status.warning')}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/40 mb-3 leading-relaxed">{con.summary}</p>
                      {con.risks.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {con.risks.map((r: string) => (
                            <span key={r} className="text-[9px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">! {r}</span>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{t('cb.security.safety_score')}: <span className={con.score > 70 ? 'text-[#39ff6e]' : 'text-red-400'}>{con.score}/100</span></div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleGenerateSecurityVideo(`Contract risk with ${con.brand}: ${con.summary}`)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#00d4ff] transition-all"
                            title="Generate Explanatory Video"
                          >
                            <Video className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleAnalyseContract(con.id)}
                            className="text-[10px] font-bold text-[#00d4ff] hover:underline uppercase tracking-widest"
                          >
                            {t('cb.security.analyse')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[32px] shadow-sm backdrop-blur-md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-['Fraunces'] font-black">{t('cb.security.shadowban')}</h3>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-amber-500" />
                  </div>
                </div>
                {shadowbanData && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#39ff6e]/10 text-[#39ff6e] rounded-xl border border-[#39ff6e]/20">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">{t('cb.security.status_label')}: {shadowbanData.status}</span>
                    </div>
                    <div className="h-32 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={shadowbanData.reachTrend}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="date" hide />
                          <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0a0a1a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)', fontSize: '10px', color: 'white' }}
                            itemStyle={{ color: '#00d4ff' }}
                          />
                          <Line type="monotone" dataKey="expected" stroke="rgba(255,255,255,0.2)" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                          <Line type="monotone" dataKey="actual" stroke="#00d4ff" strokeWidth={3} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between text-[9px] text-white/40 font-bold uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#00d4ff]" /> {t('cb.security.actual_reach')}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-white/20 border border-dashed border-white/40" /> {t('cb.security.expected')}
                      </div>
                    </div>
                    <button 
                      onClick={handleCheckShadowban}
                      className="w-full mt-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white/60 transition-all uppercase tracking-widest"
                    >
                      {t('cb.security.deep_analysis') || 'Run Deep Analysis'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Creator Insurance */}
            <div className="p-8 bg-gradient-to-br from-[#00d4ff] to-[#0099cc] rounded-[32px] text-black shadow-[0_20px_40px_rgba(0,212,255,0.2)]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-6 h-6 text-black/80" />
                    <h3 className="text-2xl font-['Fraunces'] font-black">{t('cb.security.insurance')}</h3>
                  </div>
                  <p className="text-sm text-black/70 max-w-xl leading-relaxed font-medium">
                    {t('cb.security.insurance_desc')}
                  </p>
                </div>
                {insuranceData && (
                  <div className="bg-black/10 backdrop-blur-md p-6 rounded-2xl border border-black/10 min-w-[240px]">
                    <div className="text-[9px] text-black/60 uppercase font-bold tracking-widest mb-1">{t('cb.security.active_policy')}</div>
                    <div className="text-lg font-bold mb-4">{insuranceData.provider}</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[8px] text-black/50 uppercase font-bold tracking-widest">{t('cb.security.coverage')}</div>
                        <div className="text-xs font-bold">{insuranceData.coverageLimit}</div>
                      </div>
                      <div>
                        <div className="text-[8px] text-black/50 uppercase font-bold tracking-widest">{t('cb.security.next_payment')}</div>
                        <div className="text-xs font-bold">{insuranceData.nextPayment}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {insuranceData?.legalCases.length > 0 && (
                <div className="mt-8 pt-8 border-t border-black/10">
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-4">{t('cb.security.cases_title')}</div>
                  <div className="space-y-3">
                    {insuranceData.legalCases.map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between p-4 bg-black/5 rounded-xl border border-black/5">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center text-xs">⚖️</div>
                          <div>
                            <div className="text-xs font-bold">{c.opponent}</div>
                            <div className="text-[10px] text-black/50 font-medium">{c.status}</div>
                          </div>
                        </div>
                        <div className="text-xs font-bold text-green-700 uppercase tracking-widest">{c.result}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {activeView === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-2xl font-black font-['Fraunces']">{t('cb.sidebar.settings')}</h2>
            
            <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
              <h3 className="text-lg font-bold mb-4">Admin Tools</h3>
              <p className="text-sm text-white/60 mb-6">These tools are only available to platform administrators.</p>
              
              {isAdmin() ? (
                <button 
                  onClick={seedDemoData}
                  className="px-6 py-3 bg-[#00d4ff] text-black font-black rounded-xl hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" /> Seed Demo Data
                </button>
              ) : (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                  <Lock className="w-5 h-5" /> Access Restricted
                </div>
              )}
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
              <h3 className="text-lg font-bold mb-4">Account Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div>
                    <p className="text-sm font-bold">Email Notifications</p>
                    <p className="text-[10px] text-white/40">Receive updates about your account.</p>
                  </div>
                  <div className="w-12 h-6 bg-[#00d4ff] rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-black rounded-full" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div>
                    <p className="text-sm font-bold">Two-Factor Authentication</p>
                    <p className="text-[10px] text-white/40">Add an extra layer of security.</p>
                  </div>
                  <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white/40 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'profile' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="relative h-64 rounded-[40px] overflow-hidden border border-white/10">
              <img src="https://picsum.photos/seed/profile-banner/1200/400" className="w-full h-full object-cover" alt="Banner" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-transparent" />
            </div>
            
            <div className="px-8 -mt-20 relative z-10">
              <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
                <div className="w-32 h-32 rounded-[32px] bg-gradient-to-br from-[#00d4ff] to-purple-500 p-[2px]">
                  <div className="w-full h-full rounded-[30px] bg-[#050510] p-1">
                    <img src={profile?.avatar || user?.photoURL || "https://picsum.photos/seed/max/100/100"} className="w-full h-full rounded-[26px] object-cover" alt="Avatar" />
                  </div>
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-3xl font-black font-['Fraunces']">{profile?.name || user?.displayName || 'Max Creator'}</h2>
                    {profile?.verified && <CheckCircle2 className="w-6 h-6 text-[#00d4ff]" />}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-white/40 font-bold tracking-tight">{profile?.handle || '@max_creator'}</span>
                    <div className="flex gap-3">
                      {['youtube', 'instagram', 'tiktok', 'x'].map(platform => {
                        const isConnected = socials?.[platform]?.connected;
                        const link = socials?.[platform]?.link;
                        const Icon = platform === 'youtube' ? Youtube : platform === 'instagram' ? Instagram : platform === 'tiktok' ? Music : platform === 'x' ? Twitter : null;
                        if (!Icon) return null;
                        return (
                          <a 
                            key={platform}
                            href={link || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                            className={`transition-all ${isConnected ? 'text-white hover:text-[#00d4ff] hover:scale-110' : 'text-white/10 cursor-not-allowed'}`}
                            onClick={(e) => !isConnected && e.preventDefault()}
                          >
                            <Icon className="w-5 h-5" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pb-2">
                  <button className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">{t('cb.profile.edit')}</button>
                  <button className="px-6 py-2.5 bg-[#00d4ff] text-black rounded-xl text-xs font-black shadow-[0_0_20px_rgba(0,212,255,0.2)] hover:scale-105 transition-transform">{t('cb.profile.share')}</button>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-8">
                <MetricCard label={t('cb.stats.trust_score')} value={trustScore.toString()} sub={t('cb.stats.verified')} subColor="text-[#39ff6e]" valueColor="text-[#00d4ff]" />
                <MetricCard label={t('cb.stats.followers')} value="125k" sub={`+1.2k ${t('cb.stats.week_growth')}`} subColor="text-[#39ff6e]" />
                <MetricCard label={t('cb.stats.engagement')} value="4.8%" sub={t('cb.stats.above_avg')} subColor="text-[#39ff6e]" />
                <MetricCard label={t('cb.stats.content_score')} value="94" sub={t('cb.stats.top_percent')} subColor="text-[#39ff6e]" />
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-white/40">{t('cb.profile.recent_posts')}</h3>
                  <div className="space-y-6">
                    {posts.filter(p => p.authorId === user?.uid).map(post => (
                      <FeedPost key={post.id} post={post} />
                    ))}
                    {posts.filter(p => p.authorId === user?.uid).length === 0 && (
                      <div className="p-12 bg-white/[0.02] border border-dashed border-white/10 rounded-[32px] text-center">
                        <p className="text-white/20 text-sm">{t('cb.profile.no_posts')}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">About</h3>
                    <p className="text-sm text-white/60 leading-relaxed">
                      Tech enthusiast and content creator exploring the intersection of AI, design, and the future of work. Building the next generation of creative tools.
                    </p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">Connected Platforms</h3>
                    <div className="space-y-3">
                      {Object.entries(socials).map(([id, data]: [string, any]) => (
                        <div key={id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${data.connected ? 'bg-[#00d4ff]/10 text-[#00d4ff]' : 'bg-white/5 text-white/20'}`}>
                              {id === 'youtube' && <Youtube className="w-4 h-4" />}
                              {id === 'instagram' && <Instagram className="w-4 h-4" />}
                              {id === 'tiktok' && <Music className="w-4 h-4" />}
                              {id === 'x' && <Twitter className="w-4 h-4" />}
                            </div>
                            <span className="text-xs font-bold capitalize">{id}</span>
                          </div>
                          <span className={`text-[10px] font-bold ${data.connected ? 'text-[#39ff6e]' : 'text-white/20'}`}>
                            {data.connected ? 'Connected' : 'Disconnected'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'inquiries' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-black font-['Fraunces'] mb-2">My <span className="text-[#00d4ff]">Inquiries</span></h1>
              <p className="text-white/60 text-sm">Track your messages sent to creators.</p>
            </div>

            <div className="grid gap-4">
              {myInquiries.map((inquiry) => {
                const creator = marketCreators.find(c => c.id === inquiry.receiverId);
                return (
                  <div key={inquiry.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between hover:bg-white/[0.07] transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/10 overflow-hidden border border-white/10">
                        <img src={creator?.avatar || "https://picsum.photos/seed/creator/100/100"} alt={creator?.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">{creator?.name || 'Unknown Creator'}</div>
                        <div className="text-white/40 text-xs">{inquiry.createdAt?.toDate().toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex-1 px-8">
                      <p className="text-sm text-white/60 line-clamp-1 italic">"{inquiry.message}"</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        inquiry.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                        inquiry.status === 'responded' ? 'bg-[#39ff6e]/20 text-[#39ff6e]' :
                        'bg-white/10 text-white/40'
                      }`}>
                        {inquiry.status}
                      </span>
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-white">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {myInquiries.length === 0 && (
                <div className="p-20 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[32px]">
                  <Mail className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-white/40 font-bold">No inquiries sent yet.</p>
                  <button onClick={() => setActiveView('market')} className="mt-4 text-[#00d4ff] text-sm font-bold hover:underline">Browse Market</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'bookings' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-black font-['Fraunces'] mb-2">My <span className="text-[#00d4ff]">Bookings</span></h1>
              <p className="text-white/60 text-sm">Manage your active and past creator bookings.</p>
            </div>

            <div className="grid gap-4">
              {myBookings.map((booking) => {
                const creator = marketCreators.find(c => c.id === booking.creatorId);
                return (
                  <div key={booking.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between hover:bg-white/[0.07] transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/10 overflow-hidden border border-white/10">
                        <img src={creator?.avatar || "https://picsum.photos/seed/creator/100/100"} alt={creator?.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">{creator?.name || 'Unknown Creator'}</div>
                        <div className="text-white/40 text-xs">{booking.serviceType} • {booking.createdAt?.toDate().toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex-1 px-8">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white/60">Price:</span>
                        <span className="text-sm font-black text-[#39ff6e]">€{booking.price?.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-white/40 line-clamp-1">{booking.details}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                        booking.status === 'confirmed' ? 'bg-[#00d4ff]/20 text-[#00d4ff]' :
                        booking.status === 'completed' ? 'bg-[#39ff6e]/20 text-[#39ff6e]' :
                        'bg-red-500/20 text-red-500'
                      }`}>
                        {booking.status}
                      </span>
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-white">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {myBookings.length === 0 && (
                <div className="p-20 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[32px]">
                  <FileText className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-white/40 font-bold">No bookings yet.</p>
                  <button onClick={() => setActiveView('market')} className="mt-4 text-[#00d4ff] text-sm font-bold hover:underline">Start Booking</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'market' && (
          <div className="space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black font-['Fraunces'] mb-2">Creator <span className="text-[#00d4ff]">Market</span></h1>
                <p className="text-white/60 text-sm">Discover and book verified creators for your next campaign.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input 
                    type="text" 
                    value={marketSearch}
                    onChange={(e) => setMarketSearch(e.target.value)}
                    placeholder="Search creators..."
                    className="w-full sm:w-64 pl-12 pr-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm focus:outline-none focus:border-[#00d4ff]/40 transition-all"
                  />
                </div>
                <button 
                  onClick={() => setShowMarketFilters(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold hover:bg-white/10 transition-all"
                >
                  <Settings className="w-4 h-4" /> Filters
                </button>
                <select 
                  value={marketSortBy}
                  onChange={(e) => setMarketSortBy(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-sm font-bold focus:outline-none focus:border-[#00d4ff]/40 transition-all appearance-none cursor-pointer"
                >
                  <option value="relevance">Relevance</option>
                  <option value="reach">Highest Reach</option>
                  <option value="trust">Highest Trust</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
              {['All', 'Lifestyle', 'Tech', 'Fashion', 'Gaming', 'Food', 'Fitness', 'Education', 'Business'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setMarketCategory(cat)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${marketCategory === cat ? 'bg-[#00d4ff] text-black shadow-[0_0_15px_rgba(0,212,255,0.3)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {marketCategory === 'All' && !marketSearch && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black font-['Fraunces'] flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> Featured Creators
                  </h3>
                  <button className="text-xs font-bold text-[#00d4ff] hover:underline">View All</button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {marketCreators.slice(0, 3).map(creator => (
                    <motion.div 
                      key={`featured-${creator.id}`}
                      whileHover={{ y: -8 }}
                      onClick={() => {
                        setSelectedCreator(creator);
                        setShowCreatorProfile(true);
                      }}
                      className="group relative h-64 rounded-[32px] overflow-hidden cursor-pointer shadow-2xl border border-white/10"
                    >
                      <img src={creator.avatar} alt={creator.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#39ff6e] animate-pulse" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Featured</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-xl font-black text-white">{creator.name}</h4>
                          <ShieldCheck className="w-4 h-4 text-[#00d4ff]" />
                        </div>
                        <p className="text-white/60 text-xs mb-4 line-clamp-1">{creator.bio}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-xs font-black text-white">{creator.followers}</div>
                              <div className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Reach</div>
                            </div>
                            <div className="w-px h-6 bg-white/10" />
                            <div className="text-center">
                              <div className="text-xs font-black text-[#00d4ff]">{creator.trustScore}%</div>
                              <div className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Trust</div>
                            </div>
                          </div>
                          <div className="px-4 py-2 bg-white text-black text-[10px] font-black rounded-xl uppercase tracking-widest group-hover:bg-[#00d4ff] transition-colors">
                            Book Now
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black font-['Fraunces']">
                  {marketCategory === 'All' ? 'All Creators' : `${marketCategory} Creators`}
                </h3>
                <span className="text-xs font-bold text-white/40">{filteredCreators.length} results</span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCreators.map(creator => (
                  <motion.div 
                    key={creator.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    onClick={() => {
                      setSelectedCreator(creator);
                      setShowCreatorProfile(true);
                    }}
                    className="group bg-white/[0.03] border border-white/10 rounded-[32px] overflow-hidden hover:bg-white/[0.07] transition-all cursor-pointer flex flex-col h-full shadow-lg hover:shadow-2xl"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] to-transparent opacity-60" />
                      <div className="absolute top-4 left-4 flex gap-2">
                        {creator.platforms.slice(0, 2).map(p => (
                          <div key={p} className="w-8 h-8 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
                            {p === 'YouTube' && <Youtube className="w-4 h-4 text-red-500" />}
                            {p === 'Instagram' && <Instagram className="w-4 h-4 text-pink-500" />}
                            {p === 'TikTok' && <Music2 className="w-4 h-4 text-white" />}
                            {p === 'X' && <Twitter className="w-4 h-4 text-blue-400" />}
                          </div>
                        ))}
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <div className="px-3 py-1 bg-[#39ff6e]/10 backdrop-blur-md border border-[#39ff6e]/20 rounded-full">
                          <span className="text-[10px] font-black text-[#39ff6e] uppercase tracking-widest">Verified</span>
                        </div>
                        <div className="flex items-center gap-1 text-white font-black text-sm">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          4.9
                        </div>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-black text-lg group-hover:text-[#00d4ff] transition-colors">{creator.name}</h3>
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{creator.country}</span>
                      </div>
                      <p className="text-white/40 text-xs line-clamp-2 mb-6 flex-1">{creator.bio}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div>
                          <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-1">Reach</div>
                          <div className="text-sm font-black text-white">{creator.followers}</div>
                        </div>
                        <div>
                          <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-1">Trust</div>
                          <div className="text-sm font-black text-[#00d4ff]">{creator.trustScore}%</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Starting at</div>
                          <div className="text-lg font-black text-[#39ff6e]">€{creator.price.replace(/[^0-9]/g, '')}</div>
                        </div>
                        <button className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:bg-[#00d4ff] group-hover:text-black transition-all">
                          Profile
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {filteredCreators.length === 0 && (
              <div className="py-32 text-center space-y-6 bg-white/[0.02] border border-dashed border-white/10 rounded-[40px]">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10">
                  <Search className="w-10 h-10 text-white/20" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">No creators found</h3>
                  <p className="text-white/40 text-sm max-w-xs mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
                </div>
                <button 
                  onClick={() => {
                    setMarketSearch('');
                    setMarketCategory('All');
                    setMarketVerifiedOnly(false);
                    setMarketMinFollowers('All');
                    setMarketLanguage('All');
                    setMarketCountry('All');
                    setMarketPlatform('All');
                  }}
                  className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {showCreatorProfile && selectedCreator && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-[#050510]/80 backdrop-blur-xl"
              onClick={() => setShowCreatorProfile(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a1a] border border-white/10 rounded-[40px] p-0 shadow-2xl no-scrollbar"
            >
              <div className="relative h-48 sm:h-64 rounded-t-[40px] overflow-hidden">
                <img src={`https://picsum.photos/seed/${selectedCreator.id}/1200/400`} className="w-full h-full object-cover opacity-40" alt="Banner" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-[#0a0a1a]/40 to-transparent" />
                <button 
                  onClick={() => setShowCreatorProfile(false)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/60 transition-colors z-20"
                >
                  <span className="text-white/60 font-bold">✕</span>
                </button>
              </div>

              <div className="px-8 pb-12 -mt-20 relative z-10">
                <div className="flex flex-col md:flex-row items-end gap-6 mb-12">
                  <div className="w-32 h-32 rounded-[32px] bg-gradient-to-br from-[#00d4ff] to-purple-500 p-[2px] shadow-2xl">
                    <div className="w-full h-full rounded-[30px] bg-[#0a0a1a] p-1">
                      <img src={selectedCreator.avatar} className="w-full h-full rounded-[26px] object-cover" alt="Avatar" />
                    </div>
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-4xl font-black font-['Fraunces']">{selectedCreator.name}</h2>
                      {selectedCreator.verified && <CheckCircle2 className="w-6 h-6 text-[#00d4ff]" />}
                      <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                        selectedCreator.verificationStatus === 'verified' ? 'bg-[#00d4ff]/10 border-[#00d4ff]/30 text-[#00d4ff]' :
                        selectedCreator.verificationStatus === 'beta' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' :
                        'bg-white/5 border-white/10 text-white/40'
                      }`}>
                        {selectedCreator.verificationStatus || 'Unverified'}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="text-[#00d4ff] font-bold tracking-tight">{selectedCreator.handle}</span>
                      <div className="flex gap-3">
                        {['youtube', 'instagram', 'tiktok', 'x'].map(platform => {
                          const Icon = platform === 'youtube' ? Youtube : platform === 'instagram' ? Instagram : platform === 'tiktok' ? Music : platform === 'x' ? Twitter : null;
                          if (!Icon) return null;
                          const hasPlatform = selectedCreator.platforms?.includes(platform.charAt(0).toUpperCase() + platform.slice(1));
                          return (
                            <div 
                              key={platform}
                              className={`transition-all ${hasPlatform ? 'text-white' : 'text-white/10'}`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-2 text-white/40 text-xs font-bold">
                        <MapPin className="w-3 h-3" />
                        {selectedCreator.country || 'Global'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                  <div className="p-6 bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-md">
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Reach</div>
                    <div className="text-2xl font-black text-white">{selectedCreator.followers}</div>
                    <div className="text-[10px] font-bold text-[#39ff6e] mt-1">Verified</div>
                  </div>
                  <div className="p-6 bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-md">
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Trust Score</div>
                    <div className="text-2xl font-black text-[#00d4ff]">{selectedCreator.trustScore}</div>
                    <div className="text-[10px] font-bold text-white/40 mt-1">Market Standard</div>
                  </div>
                  <div className="p-6 bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-md">
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Category</div>
                    <div className="text-2xl font-black text-white">{selectedCreator.category}</div>
                    <div className="text-[10px] font-bold text-white/40 mt-1">Niche Expert</div>
                  </div>
                  <div className="p-6 bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-md">
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Language</div>
                    <div className="text-2xl font-black text-white">{selectedCreator.language || 'English'}</div>
                    <div className="text-[10px] font-bold text-white/40 mt-1">Primary</div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 mb-12">
                  <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-sm font-black uppercase tracking-widest text-white/40">About</h3>
                      <p className="text-white/60 leading-relaxed">{selectedCreator.bio}</p>
                    </div>

                    <div className="bg-white/[0.02] border border-white/10 rounded-[32px] p-8">
                      <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-6">Services & Pricing</h3>
                      <div className="space-y-6">
                        {[
                          { name: 'Dedicated Video', desc: 'Full integration (3-5 mins)', price: selectedCreator.price },
                          { name: 'Shoutout', desc: '30-60 seconds mention', price: `€${(parseFloat(selectedCreator.price.replace(/[^0-9.]/g, '')) * 0.6).toFixed(0)}+` },
                          { name: 'Social Post', desc: 'Instagram / X / TikTok', price: `€${(parseFloat(selectedCreator.price.replace(/[^0-9.]/g, '')) * 0.3).toFixed(0)}+` }
                        ].map(service => (
                          <div key={service.name} className="flex justify-between items-center group">
                            <div>
                              <div className="font-bold text-lg group-hover:text-[#00d4ff] transition-colors">{service.name}</div>
                              <div className="text-xs text-white/40">{service.desc}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-black text-xl text-[#39ff6e]">{service.price}</div>
                              <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Starting at</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="bg-white/[0.02] border border-white/10 rounded-[32px] p-8">
                      <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-6">Audience</h3>
                      {(() => {
                        const demo = getDemographics(selectedCreator);
                        return (
                          <div className="space-y-8">
                            <div className="space-y-4">
                              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Age Groups</p>
                              <div className="space-y-3">
                                {demo.ageGroups.map((group: any) => (
                                  <div key={group.label} className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-bold">
                                      <span>{group.label}</span>
                                      <span className="text-[#00d4ff]">{group.value}%</span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${group.value}%` }}
                                        className="h-full bg-[#00d4ff]"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Top Locations</p>
                              <div className="space-y-3">
                                {demo.topLocations.map((loc: any) => (
                                  <div key={loc.label} className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-bold">
                                      <span>{loc.label}</span>
                                      <span className="text-[#00d4ff]">{loc.value}%</span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${loc.value}%` }}
                                        className="h-full bg-[#00d4ff]"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="p-6 bg-[#00d4ff]/5 border border-[#00d4ff]/20 rounded-[32px] flex items-center gap-4">
                      <ShieldCheck className="w-10 h-10 text-[#00d4ff]" />
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-[#00d4ff]">CreatorSeal Protected</p>
                        <p className="text-[10px] text-white/40">Secure payments & verified delivery guaranteed.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => {
                      setShowCreatorProfile(false);
                      setShowInquiryModal(true);
                    }}
                    className="flex-1 py-5 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" /> Send Inquiry
                  </button>
                  <button 
                    onClick={() => {
                      setShowCreatorProfile(false);
                      setShowBookingModal(true);
                    }}
                    className="flex-1 py-5 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" /> Book Now
                  </button>
                  <button 
                    onClick={() => {
                      setShowCreatorProfile(false);
                      setShowBookingModal(true);
                    }}
                    className="flex-1 py-5 rounded-2xl bg-[#00d4ff] text-black text-sm font-black shadow-[0_0_30px_rgba(0,212,255,0.3)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" /> Stripe Booking
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showBookingModal && selectedCreator && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-[#050510]/80 backdrop-blur-xl"
              onClick={() => setShowBookingModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-lg bg-[#0a0a1a] border border-white/10 rounded-[32px] p-8 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-8">
                <img src={selectedCreator.avatar} alt={selectedCreator.name} className="w-16 h-16 rounded-2xl object-cover border border-white/10" />
                <div>
                  <h2 className="text-2xl font-black font-['Fraunces']">Book {selectedCreator.name}</h2>
                  <p className="text-white/60 text-sm">Select a service and provide campaign details.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Service</label>
                  <select 
                    value={bookingService}
                    onChange={(e) => setBookingService(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-[#00d4ff]/40 transition-all appearance-none"
                  >
                    <option value="Dedicated Video">Dedicated Video</option>
                    <option value="Shoutout">Shoutout</option>
                    <option value="Social Post">Social Post</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Campaign Details</label>
                  <textarea 
                    value={bookingDetails}
                    onChange={(e) => setBookingDetails(e.target.value)}
                    placeholder="Describe your product, timeline, and expectations..."
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#00d4ff]/40 transition-all resize-none"
                  />
                </div>

                <div className="p-4 bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-2xl flex justify-between items-center">
                  <span className="text-sm font-bold text-[#00d4ff]">Total Price</span>
                  <span className="text-xl font-black text-[#00d4ff]">
                    €{
                      (() => {
                        let basePrice = parseFloat(selectedCreator.price.replace(/[^0-9.]/g, ''));
                        if (isNaN(basePrice)) basePrice = 100;
                        if (bookingService === 'Shoutout') return (basePrice * 0.6).toFixed(2);
                        if (bookingService === 'Social Post') return (basePrice * 0.3).toFixed(2);
                        return basePrice.toFixed(2);
                      })()
                    }
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setShowBookingModal(false)}
                      className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleBookNow}
                      disabled={!bookingDetails.trim()}
                      className="flex-1 py-4 rounded-2xl bg-white/10 border border-white/20 text-white text-xs font-black hover:bg-white/20 transition-all disabled:opacity-50"
                    >
                      Pay with Balance
                    </button>
                  </div>
                  <button 
                    onClick={handleStripeBooking}
                    disabled={!bookingDetails.trim()}
                    className="w-full py-4 rounded-2xl bg-[#00d4ff] text-black text-xs font-black shadow-[0_0_20px_rgba(0,212,255,0.2)] hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" /> Pay with Stripe
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showInquiryModal && selectedCreator && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-[#050510]/80 backdrop-blur-xl"
              onClick={() => setShowInquiryModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-lg bg-[#0a0a1a] border border-white/10 rounded-[32px] p-8 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-8">
                <img src={selectedCreator.avatar} alt={selectedCreator.name} className="w-16 h-16 rounded-2xl object-cover border border-white/10" />
                <div>
                  <h2 className="text-2xl font-black font-['Fraunces']">Inquiry for {selectedCreator.name}</h2>
                  <p className="text-white/60 text-sm">Send a direct message to discuss a collaboration.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Message</label>
                  <textarea 
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder="Describe your campaign or project..."
                    className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#00d4ff]/40 transition-all resize-none"
                  />
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowInquiryModal(false)}
                    className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSendInquiry}
                    disabled={!inquiryMessage.trim()}
                    className="flex-1 py-4 rounded-2xl bg-[#00d4ff] text-black text-xs font-black shadow-[0_0_20px_rgba(0,212,255,0.2)] hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    Send Inquiry
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showGroupModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-[#050510]/80 backdrop-blur-xl"
              onClick={() => setShowGroupModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-lg bg-[#0a0a1a] border border-white/10 rounded-[32px] p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-black font-['Fraunces'] mb-2">Create New Group</h2>
              <p className="text-white/60 text-sm mb-8">Build a community around your brand or niche.</p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Group Name</label>
                  <input 
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g., Tech Creators Hub"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#00d4ff]/40 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Description</label>
                  <textarea 
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="What is this group about?"
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#00d4ff]/40 transition-all resize-none"
                  />
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowGroupModal(false)}
                    className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateGroup}
                    disabled={!newGroupName.trim() || !newGroupDescription.trim()}
                    className="flex-1 py-4 rounded-2xl bg-[#00d4ff] text-black text-xs font-black shadow-[0_0_20px_rgba(0,212,255,0.2)] hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    Create Group
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showWorkflowModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-[#050510]/80 backdrop-blur-xl"
              onClick={() => setShowWorkflowModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-lg bg-[#0a0a1a] border border-white/10 rounded-[32px] p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-black font-['Fraunces'] mb-2">New Workflow</h2>
              <p className="text-white/60 text-sm mb-8">Automate your tasks with a new workflow.</p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Name</label>
                  <input 
                    type="text"
                    value={newWorkflow.name}
                    onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                    placeholder="e.g., Welcome New Followers"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#00d4ff]/40 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Trigger</label>
                  <select 
                    value={newWorkflow.trigger}
                    onChange={(e) => setNewWorkflow({ ...newWorkflow, trigger: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-[#00d4ff]/40 transition-all appearance-none"
                  >
                    <option value="New Follower">New Follower</option>
                    <option value="New Booking">New Booking</option>
                    <option value="New Inquiry">New Inquiry</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Action</label>
                  <select 
                    value={newWorkflow.action}
                    onChange={(e) => setNewWorkflow({ ...newWorkflow, action: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-[#00d4ff]/40 transition-all appearance-none"
                  >
                    <option value="Send Welcome DM">Send Welcome DM</option>
                    <option value="Send Email Notification">Send Email Notification</option>
                    <option value="Add to CRM">Add to CRM</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowWorkflowModal(false)}
                    className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateWorkflow}
                    disabled={!newWorkflow.name.trim()}
                    className="flex-1 py-4 rounded-2xl bg-[#00d4ff] text-black text-xs font-black shadow-[0_0_20px_rgba(0,212,255,0.2)] hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    Create Workflow
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showWebhookModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-[#050510]/80 backdrop-blur-xl"
              onClick={() => setShowWebhookModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-lg bg-[#0a0a1a] border border-white/10 rounded-[32px] p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-black font-['Fraunces'] mb-2">New Webhook</h2>
              <p className="text-white/60 text-sm mb-8">Configure a webhook to receive real-time events.</p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Name</label>
                  <input 
                    type="text"
                    value={newWebhook.name}
                    onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                    placeholder="e.g., Zapier Integration"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#00d4ff]/40 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Payload URL</label>
                  <input 
                    type="url"
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                    placeholder="https://your-domain.com/webhook"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#00d4ff]/40 transition-all font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Events</label>
                  <div className="flex flex-wrap gap-2">
                    {['booking.created', 'booking.updated', 'inquiry.received', 'follower.new'].map(evt => (
                      <button
                        key={evt}
                        onClick={() => {
                          if (newWebhook.events.includes(evt)) {
                            setNewWebhook({ ...newWebhook, events: newWebhook.events.filter(e => e !== evt) });
                          } else {
                            setNewWebhook({ ...newWebhook, events: [...newWebhook.events, evt] });
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${newWebhook.events.includes(evt) ? 'bg-purple-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                      >
                        {evt}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowWebhookModal(false)}
                    className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateWebhook}
                    disabled={!newWebhook.name.trim() || !newWebhook.url.trim() || newWebhook.events.length === 0}
                    className="flex-1 py-4 rounded-2xl bg-purple-500 text-white text-xs font-black shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    Create Webhook
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showTopUpModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-[#050510]/80 backdrop-blur-xl"
              onClick={() => setShowTopUpModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-md bg-[#0a0a1a] border border-white/10 rounded-[32px] p-8 shadow-2xl"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-black text-[#00d4ff]">€</span>
                </div>
                <h2 className="text-2xl font-black font-['Fraunces']">Top Up Balance</h2>
                <p className="text-white/60 text-sm mt-2">Add credits to your account to book creators or use premium AI tools.</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  {['50', '100', '250', '500', '1000', '5000'].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setTopUpAmount(amount)}
                      className={`py-3 rounded-xl border text-sm font-bold transition-all ${topUpAmount === amount ? 'bg-[#00d4ff] border-[#00d4ff] text-black' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'}`}
                    >
                      €{amount}
                    </button>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Custom Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">€</span>
                    <input 
                      type="number" 
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-8 pr-4 text-sm font-bold focus:outline-none focus:border-[#00d4ff]/40 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setShowTopUpModal(false)}
                    className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleTopUp}
                    disabled={!topUpAmount || parseFloat(topUpAmount) <= 0}
                    className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all disabled:opacity-50"
                  >
                    Stripe Checkout
                  </button>
                  <button 
                    onClick={simulateTopUp}
                    disabled={!topUpAmount || parseFloat(topUpAmount) <= 0}
                    className="flex-1 py-4 rounded-2xl bg-[#00d4ff] text-black text-xs font-black shadow-[0_0_20px_rgba(0,212,255,0.2)] hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    Demo Top Up
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showMarketFilters && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-[#050510]/80 backdrop-blur-xl"
              onClick={() => setShowMarketFilters(false)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              className="relative w-full max-w-lg bg-[#0a0a1a] border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[32px] p-8 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black font-['Fraunces']">Market Filters</h2>
                <button 
                  onClick={() => setShowMarketFilters(false)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <span className="text-white/60 font-bold">✕</span>
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Verification</label>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setMarketVerifiedOnly(!marketVerifiedOnly)}
                      className={`flex-1 py-3 rounded-xl border transition-all text-xs font-bold ${marketVerifiedOnly ? 'bg-[#00d4ff]/10 border-[#00d4ff]/40 text-[#00d4ff]' : 'bg-white/5 border-white/10 text-white/40'}`}
                    >
                      Verified Only
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Minimum Reach</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['All', '100k+', '500k+', '1M+'].map(val => (
                      <button 
                        key={val}
                        onClick={() => setMarketMinFollowers(val)}
                        className={`py-3 rounded-xl border transition-all text-xs font-bold ${marketMinFollowers === val ? 'bg-[#00d4ff]/10 border-[#00d4ff]/40 text-[#00d4ff]' : 'bg-white/5 border-white/10 text-white/40'}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Language</label>
                  <select 
                    value={marketLanguage}
                    onChange={(e) => setMarketLanguage(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold focus:outline-none focus:border-[#00d4ff]/40 transition-all appearance-none"
                  >
                    <option value="All">All Languages</option>
                    <option value="English">English</option>
                    <option value="German">German</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Platform</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['All', 'YouTube', 'Instagram', 'TikTok', 'X'].map(p => (
                      <button 
                        key={p}
                        onClick={() => setMarketPlatform(p)}
                        className={`py-3 rounded-xl border transition-all text-xs font-bold ${marketPlatform === p ? 'bg-[#00d4ff]/10 border-[#00d4ff]/40 text-[#00d4ff]' : 'bg-white/5 border-white/10 text-white/40'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setShowMarketFilters(false)}
                  className="w-full py-4 rounded-2xl bg-[#00d4ff] text-black font-black text-sm shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:scale-[1.02] transition-transform"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {activeView === 'wallet' && (
          <WalletView 
            profile={profile}
            transactions={transactions}
            myBookings={myBookings}
            onShowTopUp={() => setShowTopUpModal(true)}
            onStripeConnect={handleStripeConnect}
            onStripeDashboard={handleStripeDashboard}
          />
        )}

        {activeView === 'pricing' && (
          <div className="max-w-6xl mx-auto space-y-12 pb-20">
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-black font-['Fraunces']">Choose Your <span className="text-[#00d4ff]">Plan</span></h1>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">Scale your creator business with professional tools, verified trust, and automated workflows.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Silver Plan */}
              <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[40px] backdrop-blur-md flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Zap className="w-32 h-32" />
                </div>
                <div className="mb-8">
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Individual</div>
                  <h3 className="text-3xl font-black mb-2">Silver</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">€29</span>
                    <span className="text-white/40 text-sm font-bold">/month</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {['Verified Profile Badge', 'Basic AI Tools', '5 Automation Workflows', 'Standard Support', 'Marketplace Access'].map(feature => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-white/80">
                      <CheckCircle2 className="w-4 h-4 text-[#00d4ff]" /> {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => handleUpgrade(import.meta.env.VITE_STRIPE_PRICE_SILVER || 'price_silver_test')}
                  className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-black hover:bg-white/10 transition-all"
                >
                  Get Started
                </button>
              </div>

              {/* Gold Plan */}
              <div className="p-8 bg-gradient-to-br from-[#00d4ff]/20 to-transparent border border-[#00d4ff]/30 rounded-[40px] backdrop-blur-md flex flex-col relative overflow-hidden group scale-105 shadow-[0_0_50px_rgba(0,212,255,0.1)]">
                <div className="absolute top-0 right-0 p-4">
                  <div className="px-3 py-1 bg-[#00d4ff] text-black text-[10px] font-black rounded-full uppercase tracking-widest">Popular</div>
                </div>
                <div className="mb-8">
                  <div className="text-[10px] font-black text-[#00d4ff] uppercase tracking-widest mb-2">Professional</div>
                  <h3 className="text-3xl font-black mb-2">Gold</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">€99</span>
                    <span className="text-white/40 text-sm font-bold">/month</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {['Priority Verification', 'Advanced AI Content Suite', 'Unlimited Workflows', 'Priority Support', 'Custom Webhooks', 'Advanced Analytics'].map(feature => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-white">
                      <CheckCircle2 className="w-4 h-4 text-[#00d4ff]" /> {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => handleUpgrade(import.meta.env.VITE_STRIPE_PRICE_GOLD || 'price_gold_test')}
                  className="w-full py-4 bg-[#00d4ff] text-black rounded-2xl text-sm font-black shadow-[0_0_30px_rgba(0,212,255,0.3)] hover:scale-[1.02] transition-transform"
                >
                  Upgrade Now
                </button>
              </div>

              {/* Platinum Plan */}
              <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[40px] backdrop-blur-md flex flex-col relative overflow-hidden group">
                <div className="mb-8">
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Agency</div>
                  <h3 className="text-3xl font-black mb-2">Platinum</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">€249</span>
                    <span className="text-white/40 text-sm font-bold">/month</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {['Multi-User Access', 'White-label Reports', 'Dedicated Manager', 'API Access', 'Legal Protection Suite', 'Custom Integrations'].map(feature => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-white/80">
                      <CheckCircle2 className="w-4 h-4 text-[#00d4ff]" /> {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => handleUpgrade(import.meta.env.VITE_STRIPE_PRICE_PLATINUM || 'price_platinum_test')}
                  className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-black hover:bg-white/10 transition-all"
                >
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        )}

        {activeView === 'legal' && (
          <div className="max-w-4xl mx-auto space-y-12 pb-20">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-black font-['Fraunces']">Legal & <span className="text-[#00d4ff]">Trust</span></h1>
              <p className="text-white/40 max-w-lg mx-auto">Transparency and compliance are the foundation of CreatorSeal.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-md">
                <ShieldCheck className="w-8 h-8 text-[#00d4ff] mb-4" />
                <h3 className="font-bold mb-2">Compliance</h3>
                <p className="text-xs text-white/40 leading-relaxed">Fully compliant with EU data protection regulations and platform-specific guidelines.</p>
              </div>
              <div className="p-6 bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-md">
                <Lock className="w-8 h-8 text-purple-400 mb-4" />
                <h3 className="font-bold mb-2">Data Security</h3>
                <p className="text-xs text-white/40 leading-relaxed">Your data is encrypted and stored securely. We never sell your personal information.</p>
              </div>
              <div className="p-6 bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-md">
                <CheckCircle2 className="w-8 h-8 text-green-400 mb-4" />
                <h3 className="font-bold mb-2">Verified Trust</h3>
                <p className="text-xs text-white/40 leading-relaxed">Every verified creator undergoes a multi-step manual and automated check.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#00d4ff]" /> Impressum
                </h2>
                <div className="grid sm:grid-cols-2 gap-8 text-sm">
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Company</p>
                      <p className="font-medium">RealSyncDynamics / CreatorSeal</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Address</p>
                      <p className="font-medium">Musterstraße 123<br />10115 Berlin, Germany</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Contact</p>
                      <p className="font-medium">support@creatorseal.com<br />+49 (0) 30 12345678</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Management</p>
                      <p className="font-medium">Max Mustermann</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-400" /> Privacy Policy
                </h2>
                <div className="prose prose-invert prose-sm max-w-none text-white/60">
                  <p>We take your privacy seriously. This policy describes how we collect, use, and handle your information when you use our services.</p>
                  <h4 className="text-white font-bold mt-4">1. Data Collection</h4>
                  <p>We collect information you provide directly to us, such as when you create an account, connect social media profiles, or communicate with us.</p>
                  <h4 className="text-white font-bold mt-4">2. Use of Information</h4>
                  <p>We use the information we collect to provide, maintain, and improve our services, and to develop new ones.</p>
                  <h4 className="text-white font-bold mt-4">3. Data Sharing</h4>
                  <p>We do not share your personal information with third parties except as described in this policy or with your consent.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Video Generation Modal */}
        <AnimatePresence>
          {showVideoModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => !isGeneratingSecurityVideo && setShowVideoModal(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-[#0a0a1a] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-purple-500/10">
                        <Video className="w-6 h-6 text-purple-400" />
                      </div>
                      <h3 className="text-xl font-['Fraunces'] font-black">AI Security Explainer</h3>
                    </div>
                    {!isGeneratingSecurityVideo && (
                      <button 
                        onClick={() => setShowVideoModal(false)}
                        className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all"
                      >
                        <Plus className="w-6 h-6 rotate-45" />
                      </button>
                    )}
                  </div>

                  <div className="aspect-video bg-black/40 rounded-2xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
                    {isGeneratingSecurityVideo ? (
                      <div className="text-center space-y-4 p-8">
                        <div className="w-16 h-16 border-4 border-[#00d4ff]/20 border-t-[#00d4ff] rounded-full animate-spin mx-auto" />
                        <p className="text-sm font-bold text-[#00d4ff] animate-pulse">{securityVideoStatus}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">Veo AI is crafting your security brief</p>
                      </div>
                    ) : securityVideoUrl ? (
                      <video 
                        src={securityVideoUrl} 
                        controls 
                        autoPlay 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center p-8">
                        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4 opacity-20" />
                        <p className="text-sm text-white/40">{securityVideoStatus || "Ready to generate security video"}</p>
                      </div>
                    )}
                  </div>

                  {!isGeneratingSecurityVideo && securityVideoUrl && (
                    <div className="mt-8 flex justify-end gap-4">
                      <a 
                        href={securityVideoUrl} 
                        download="security-explainer.mp4"
                        className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" /> Download Video
                      </a>
                      <button 
                        onClick={() => setShowVideoModal(false)}
                        className="px-8 py-3 bg-[#00d4ff] text-black text-xs font-black rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.2)] hover:scale-105 transition-transform"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {showAnalysisModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setShowAnalysisModal(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-[#0a0a1a] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              >
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#00d4ff]/10">
                      <Sparkles className="w-6 h-6 text-[#00d4ff]" />
                    </div>
                    <h3 className="text-xl font-['Fraunces'] font-black">AI Post Analysis</h3>
                  </div>
                  <button 
                    onClick={() => setShowAnalysisModal(false)}
                    className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all"
                  >
                    <Plus className="w-6 h-6 rotate-45" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                      <div className="w-12 h-12 border-4 border-[#00d4ff]/20 border-t-[#00d4ff] rounded-full animate-spin" />
                      <p className="text-sm font-bold text-[#00d4ff] animate-pulse">Analyzing content...</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Original Content</p>
                        <p className="text-sm text-white/80 italic">"{analyzingPost?.content}"</p>
                      </div>
                      
                      <div className="prose prose-invert prose-sm max-w-none">
                        <Markdown>{analysisResult}</Markdown>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-8 border-t border-white/5 flex justify-end">
                  <button 
                    onClick={() => setShowAnalysisModal(false)}
                    className="px-8 py-3 bg-[#00d4ff] text-black text-xs font-black rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.2)] hover:scale-105 transition-transform"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  </motion.div>
);
}

function StatusBadge({ status }: { status: 'available' | 'beta' | 'planned' }) {
  const colors = {
    available: 'bg-green-500/20 text-green-400 border-green-500/20',
    beta: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
    planned: 'bg-blue-500/20 text-blue-400 border-blue-500/20'
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${colors[status]}`}>
      {status}
    </span>
  );
}

function NavButton({ active, onClick, icon, label, status }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, status?: 'available' | 'beta' | 'planned' }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${active ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
    >
      <div className={`flex items-center gap-3 ${active ? 'text-[#00d4ff]' : 'text-white/40 group-hover:text-white'} transition-colors`}>
        {icon}
        <span className="hidden md:block text-sm font-bold tracking-tight">{label}</span>
      </div>
      {status ? (
        <div className="hidden lg:block ml-auto"><StatusBadge status={status} /></div>
      ) : (
        active && <motion.div layoutId="nav-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00d4ff] shadow-[0_0_10px_#00d4ff]" />
      )}
    </button>
  );
}

function TrendingTopic({ tag, posts }: { tag: string, posts: string }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer">
      <div>
        <div className="text-sm font-bold text-white group-hover:text-[#00d4ff] transition-colors">{tag}</div>
        <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{posts} Posts</div>
      </div>
      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white transition-all" />
    </div>
  );
}

function TopCreator({ name, followers, avatar, id, onFollow }: { name: string, followers: string, avatar: string, id: string, onFollow?: (id: string) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src={avatar} alt={name} className="w-8 h-8 rounded-full border border-white/10" />
        <div>
          <div className="text-xs font-bold">{name}</div>
          <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{followers} Followers</div>
        </div>
      </div>
      <button 
        onClick={() => onFollow?.(id)}
        className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold hover:bg-[#00d4ff] hover:text-black transition-all"
      >
        Follow
      </button>
    </div>
  );
}

function MetricCard({ label, value, sub, subColor = "text-white/40", valueColor = "text-white" }: { label: string, value: string, sub: string, subColor?: string, valueColor?: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
      <div className="text-[10px] text-white/40 mb-1.5 uppercase tracking-widest font-bold">{label}</div>
      <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
      <div className={`text-[10px] mt-1 font-medium ${subColor}`}>{sub}</div>
    </div>
  );
}

function CopyrightItem({ platform, matches, status }: { platform: string, matches: number, status: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
      <div>
        <div className="text-xs font-bold text-white">{platform}</div>
        <div className="text-[10px] text-white/40">{status}</div>
      </div>
      <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${matches > 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
        {matches} Treffer
      </div>
    </div>
  );
}

function VideoItem({ title, meta, score, warn }: { title: string, meta: string, score: string, warn?: boolean }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:border-[#00d4ff]/40 cursor-pointer transition-all group backdrop-blur-sm">
      <div className="w-14 h-10 bg-white/5 rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">🎬</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold truncate text-white">{title}</div>
        <div className="text-[10px] text-white/40 mt-0.5">{meta}</div>
        <div className="flex gap-2 mt-2">
          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20">✓ C2PA</span>
          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${warn ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
            {warn ? '! AI-Label fehlt' : '✓ AI-Label'}
          </span>
        </div>
      </div>
      <div className="text-lg font-bold text-[#00d4ff]">{score}</div>
    </div>
  );
}
