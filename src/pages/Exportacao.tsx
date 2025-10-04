import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { FileDown, Database, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function Exportacao() {
  const [stats, setStats] = useState({ patients: 0, attendances: 0, actions: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [patientsResult, attendancesResult, actionsResult] = await Promise.all([
        supabase.from("patients").select("id", { count: "exact", head: true }),
        supabase.from("attendances").select("id", { count: "exact", head: true }),
        supabase.from("attendance_actions").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        patients: patientsResult.count || 0,
        attendances: attendancesResult.count || 0,
        actions: actionsResult.count || 0,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  const exportRAAS = async () => {
    setLoading(true);
    try {
      const { data: attendances, error } = await supabase
        .from("attendances")
        .select("*, patients(*)")
        .order("admission_date");

      if (error) throw error;
      if (!attendances || attendances.length === 0) {
        toast.error("Não há atendimentos para exportar!");
        return;
      }

      const hoje = new Date();
      const competencia = hoje.getFullYear() + ("0" + (hoje.getMonth() + 1)).slice(-2);
      
      const pad = (str: any, len: number) => String(str || "").toUpperCase().padEnd(len, " ").substring(0, len);
      const padNum = (num: any, len: number) => String(num || "0").padStart(len, "0").substring(0, len);
      const formatDate = (d: string) => d ? d.replace(/-/g, "") : "00000000";

      let conteudo = "";

      // LINHA 01 - CABEÇALHO
      conteudo += "01" + "#RAS#" + competencia + padNum("1", 6) + "1111" +
                 pad("CAPS 3 DR BACELAR VIANA", 30) + pad("SESMA", 6) + 
                 padNum("00000000000000", 14) + pad("SECRETARIA MUNICIPAL DE SAUDE", 40) + "M" +
                 formatDate(hoje.toISOString().substring(0, 10)) + "02.20" + 
                 padNum("0", 10) + "02.20.0" + pad("", 102) + "\r\n";

      // LINHAS 15 - DADOS DOS PACIENTES
      attendances.forEach(atend => {
        const pac = atend.patients;
        if (!pac) return;

        conteudo += "15" + "21" + atend.month_reference.replace("-", "") + "6981291" +
                   pad(pac.cns || "000000000000000", 15) +
                   formatDate(atend.admission_date) + pad("", 8) +
                   pad(pac.name, 30) + pad(pac.prontuario, 10) +
                   pad(pac.mother_name, 30) + pad(pac.address_street, 30) +
                   pad(pac.address_number, 5) + pad(pac.address_complement, 10) +
                   pad(pac.address_zipcode, 8) + pad("2111300", 7) +
                   formatDate(pac.birth_date) + pac.sex + pac.race_color +
                   pad(pac.responsible_name || pac.name, 30) + pad("010", 3) +
                   pad("", 4) + pad(pac.phone, 11) + pad(pac.mobile, 11) +
                   atend.patient_destination + pad("", 8) + pad(atend.cid_primary, 4) +
                   pad(atend.cid_secondary1, 4) + pad(atend.cid_secondary2, 4) +
                   pad(atend.cid_secondary3, 4) + pad("", 4) + pad("01", 2) +
                   atend.patient_origin + atend.esf_coverage +
                   pad(atend.esf_cnes, 7) + padNum("0", 5) + atend.patient_destination +
                   "RAS" + atend.homeless_situation + atend.drug_user +
                   pad(atend.drug_type, 3) + pad("", 13) + pad(pac.address_neighborhood, 30) +
                   pad("", 3) + pad(pac.email, 40) + pad(pac.cpf || "00000000000", 11) +
                   "    \r\n";
      });

      const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const mes = ("0" + (hoje.getMonth() + 1)).slice(-2);
      const ano = hoje.getFullYear().toString().slice(-2);
      link.href = url;
      link.download = `AACBVSES.${mes}${ano}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Arquivo RAAS exportado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao exportar:", error);
      toast.error(error.message || "Erro ao exportar arquivo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileDown className="h-8 w-8 text-primary" />
        <h2 className="text-3xl font-bold tracking-tight">Exportação RAAS</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { title: "Pacientes", value: stats.patients, icon: Database, color: "text-blue-600", bg: "bg-blue-100" },
          { title: "Atendimentos", value: stats.attendances, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
          { title: "Procedimentos", value: stats.actions, icon: FileDown, color: "text-purple-600", bg: "bg-purple-100" },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerar Arquivo RAAS</CardTitle>
          <CardDescription>
            Exporta os dados no formato oficial do Ministério da Saúde (Layout RAAS)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Atenção:</strong> Esta função gera o arquivo de produção no formato oficial RAAS 
              conforme layout atualizado. O arquivo gerado deve ser enviado ao sistema do DATASUS.
            </p>
          </div>
          <Button onClick={exportRAAS} disabled={loading} size="lg" className="gap-2">
            <FileDown className="h-5 w-5" />
            {loading ? "Gerando..." : "Exportar Arquivo RAAS (.OUT)"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
