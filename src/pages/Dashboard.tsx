import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserCog, Stethoscope, Clipboard, Activity, TrendingUp } from "lucide-react";

interface Stats {
  patients: number;
  professionals: number;
  procedures: number;
  attendances: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    patients: 0,
    professionals: 0,
    procedures: 0,
    attendances: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [patientsResult, professionalsResult, proceduresResult, attendancesResult] = await Promise.all([
        supabase.from("patients").select("id", { count: "exact", head: true }),
        supabase.from("professionals").select("id", { count: "exact", head: true }),
        supabase.from("procedures").select("id", { count: "exact", head: true }),
        supabase.from("attendances").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        patients: patientsResult.count || 0,
        professionals: professionalsResult.count || 0,
        procedures: proceduresResult.count || 0,
        attendances: attendancesResult.count || 0,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  const statCards = [
    {
      title: "Pacientes",
      value: stats.patients,
      icon: Users,
      description: "Total de pacientes cadastrados",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Profissionais",
      value: stats.professionals,
      icon: UserCog,
      description: "Total de profissionais ativos",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Procedimentos",
      value: stats.procedures,
      icon: Stethoscope,
      description: "Procedimentos cadastrados",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Atendimentos",
      value: stats.attendances,
      icon: Clipboard,
      description: "Total de atendimentos registrados",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Visão geral do Sistema RAAS - CAPS 3 DR BACELAR VIANA
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Sobre o Sistema RAAS
            </CardTitle>
            <CardDescription>Registro das Ações Ambulatoriais de Saúde</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              O RAAS é o sistema utilizado para registro e envio de informações dos atendimentos 
              realizados em CAPS (Centro de Atenção Psicossocial).
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                <span>Registro completo de pacientes e atendimentos</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                <span>Gestão de profissionais com código CBO</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                <span>Procedimentos conforme tabela SIGTAP</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                <span>Exportação no formato oficial do Ministério da Saúde</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Próximos Passos
            </CardTitle>
            <CardDescription>Comece a utilizar o sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3 text-sm">
              <div className="p-3 border rounded-lg hover:border-primary transition-colors">
                <div className="font-medium mb-1">1. Cadastre Profissionais</div>
                <p className="text-muted-foreground text-xs">
                  Registre os profissionais que atuam no CAPS com seus códigos CBO
                </p>
              </div>
              <div className="p-3 border rounded-lg hover:border-primary transition-colors">
                <div className="font-medium mb-1">2. Configure Procedimentos</div>
                <p className="text-muted-foreground text-xs">
                  Adicione os procedimentos SIGTAP realizados na unidade
                </p>
              </div>
              <div className="p-3 border rounded-lg hover:border-primary transition-colors">
                <div className="font-medium mb-1">3. Registre Pacientes</div>
                <p className="text-muted-foreground text-xs">
                  Cadastre os pacientes atendidos com dados completos
                </p>
              </div>
              <div className="p-3 border rounded-lg hover:border-primary transition-colors">
                <div className="font-medium mb-1">4. Faça Atendimentos</div>
                <p className="text-muted-foreground text-xs">
                  Registre os atendimentos vinculando profissional e procedimentos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">CAPS 3 DR BACELAR VIANA</CardTitle>
          <CardDescription>CNES: 6981291</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Centro de Atenção Psicossocial de funcionamento 24 horas, destinado ao atendimento 
            de pessoas com transtornos mentais graves e persistentes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
