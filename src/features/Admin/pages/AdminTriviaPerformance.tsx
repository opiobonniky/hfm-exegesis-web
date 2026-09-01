// AdminTriviaPerformance — thin page composing hook + components (no inline HTML)
"use client";

import { useNavigate } from "react-router-dom";
import { BarChart3, Users, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminTriviaPerformancePage } from "../hooks/useAdminTriviaPerformancePage";
import { routes } from "@/components/Routes/routes";
import { TriviaPerformanceHeader } from "../components/TriviaPerformanceHeader";
import { AdminPageContent } from "../components/AdminPageContent";
import {
  TriviaOverviewPanel,
  TriviaUsersPanel,
  TriviaQuestionsPanel,
} from "../components/TriviaPerformanceTabs";

export default function AdminTriviaPerformance() {
  const h = useAdminTriviaPerformancePage();
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-background">
      <TriviaPerformanceHeader
        onBack={() => navigate(-1)}
        onRefresh={h.loadAll}
      />

      <AdminPageContent className="py-4">
        <Tabs value={h.tab} onValueChange={h.setTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-1.5" />Overview
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-1.5" />Users
            </TabsTrigger>
            <TabsTrigger value="questions">
              <TrendingUp className="w-4 h-4 mr-1.5" />Questions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <TriviaOverviewPanel overview={h.overview} />
          </TabsContent>

          <TabsContent value="users" className="space-y-3">
            <TriviaUsersPanel
              users={h.users}
              search={h.search}
              onSearchChange={h.setSearch}
              onUserClick={(u) =>
                navigate(
                  routes.adminTriviaUserDetail.path.replace(":userId", String(u.id)),
                )
              }
            />
          </TabsContent>

          <TabsContent value="questions" className="space-y-2">
            <TriviaQuestionsPanel questions={h.questions} />
          </TabsContent>
        </Tabs>
      </AdminPageContent>
    </div>
  );
}
