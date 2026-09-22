import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { FixedContactBanner } from "@/components/layout/FixedContactBanner";
import { AdminAuthProvider } from "@/lib/admin-auth-context";
import { MemberAuthProvider } from "@/lib/member-auth-context";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AboutGreeting from "@/pages/about-greeting";
import AboutIntro from "@/pages/about-intro";
import AboutFacilities from "@/pages/about-facilities";
import AboutDirections from "@/pages/about-directions";
import Admission from "@/pages/admission";
import Support from "@/pages/support";
import SupportInfo from "@/pages/support-info";
import SupportApply from "@/pages/support-apply";
import SupportNews from "@/pages/support-news";
import SupportNewsDetail from "@/pages/support-news-detail";
import SupportVolunteer from "@/pages/support-volunteer";
import Programs from "@/pages/programs";
import Counsel from "@/pages/counsel";
import CounselLookup from "@/pages/counsel-lookup";
import Faq from "@/pages/faq";
import CommunityNotices from "@/pages/community-notices";
import CommunityNoticeDetail from "@/pages/community-notice-detail";
import CommunityGallery from "@/pages/community-gallery";
import CommunityGalleryDetail from "@/pages/community-gallery-detail";
import CommunityChildcare from "@/pages/community-childcare";
import CommunityChildcareDetail from "@/pages/community-childcare-detail";
import PrivacyPolicy from "@/pages/privacy-policy";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import AppDownload from "@/pages/app-download";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin";

const queryClient = new QueryClient();

function Router() {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");

  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about/greeting" component={AboutGreeting} />
        <Route path="/about/intro" component={AboutIntro} />
        <Route path="/about/facilities" component={AboutFacilities} />
        <Route path="/about/directions" component={AboutDirections} />
        <Route path="/admission" component={Admission} />
        <Route path="/support" component={Support} />
        <Route path="/support/info" component={SupportInfo} />
        <Route path="/support/apply" component={SupportApply} />
        <Route path="/support/news" component={SupportNews} />
        <Route path="/support/news/:id" component={SupportNewsDetail} />
        <Route path="/support/volunteer" component={SupportVolunteer} />
        <Route path="/programs" component={Programs} />
        <Route path="/counsel" component={Counsel} />
        <Route path="/counsel/lookup" component={CounselLookup} />
        <Route path="/faq" component={Faq} />
        <Route path="/community" component={CommunityNotices} />
        <Route path="/community/notices" component={CommunityNotices} />
        <Route path="/community/notices/:id" component={CommunityNoticeDetail} />
        <Route path="/community/gallery" component={CommunityGallery} />
        <Route path="/community/gallery/:id" component={CommunityGalleryDetail} />
        <Route path="/community/childcare" component={CommunityChildcare} />
        <Route path="/community/childcare/:id" component={CommunityChildcareDetail} />
        <Route path="/app/download" component={AppDownload} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin" component={AdminDashboard} />
        <Route component={NotFound} />
      </Switch>
      {!isAdmin && <FixedContactBanner />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AdminAuthProvider>
          <MemberAuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </MemberAuthProvider>
        </AdminAuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
