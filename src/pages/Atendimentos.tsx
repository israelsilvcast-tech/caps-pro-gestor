import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Clipboard, Plus, Trash2, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Attendance {
  id: string;
  patient_id: string;
  admission_date: string;
  month_reference: string;
  patient_origin: string;
  cid_primary: string;
  patient_destination: string;
  patients: { name: string };
}

interface AttendanceAction {
  id: string;
  attendance_id: string;
  professional_id: string;
  procedure_id: string;
  action_date: string;
  quantity: number;
  professionals: { name: string };
  procedures: { description: string; sigtap_code: string };
}

export default function Atendimentos() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [actions, setActions] = useState<AttendanceAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<string | null>(null);
  const [showActionsDialog, setShowActionsDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    patient_id: "",
    admission_date: "",
    month_reference: "",
    patient_origin: "01",
    cid_primary: "",
    cid_secondary1: "",
    cid_secondary2: "",
    cid_secondary3: "",
    esf_coverage: "N",
    esf_cnes: "",
    patient_destination: "00",
    homeless_situation: "N",
    drug_user: "N",
    drug_type: "",
  });

  const [actionFormData, setActionFormData] = useState({
    professional_id: "",
    procedure_id: "",
    action_date: "",
    quantity: 1,
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [attendancesResult, patientsResult, professionalsResult, proceduresResult] = await Promise.all([
        supabase.from("attendances").select("*, patients(name)").order("admission_date", { ascending: false }),
        supabase.from("patients").select("*").order("name"),
        supabase.from("professionals").select("*").eq("active", true).order("name"),
        supabase.from("procedures").select("*").eq("active", true).order("description"),
      ]);

      if (attendancesResult.data) setAttendances(attendancesResult.data);
      if (patientsResult.data) setPatients(patientsResult.data);
      if (professionalsResult.data) setProfessionals(professionalsResult.data);
      if (proceduresResult.data) setProcedures(proceduresResult.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    }
  };

  const handleAdmissionDateChange = (date: string) => {
    setFormData({
      ...formData,
      admission_date: date,
      month_reference: date.substring(0, 7),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.patient_id || !formData.admission_date || !formData.cid_primary) {
        toast.error("Paciente, Data de Admissão e CID Principal são obrigatórios!");
        return;
      }

      const { error } = await supabase
        .from("attendances")
        .insert([formData]);
      
      if (error) throw error;
      toast.success("Atendimento registrado com sucesso!");
      resetForm();
      loadData();
    } catch (error: any) {
      console.error("Erro ao salvar atendimento:", error);
      toast.error(error.message || "Erro ao salvar atendimento");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAttendance = async (id: string) => {
    if (!confirm("Deseja realmente excluir este atendimento?")) return;

    try {
      const { error } = await supabase
        .from("attendances")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Atendimento excluído!");
      loadData();
    } catch (error) {
      console.error("Erro ao excluir atendimento:", error);
      toast.error("Erro ao excluir atendimento");
    }
  };

  const loadActions = async (attendanceId: string) => {
    try {
      const { data, error } = await supabase
        .from("attendance_actions")
        .select("*, professionals(name), procedures(description, sigtap_code)")
        .eq("attendance_id", attendanceId)
        .order("action_date", { ascending: false });
      
      if (error) throw error;
      setActions(data || []);
    } catch (error) {
      console.error("Erro ao carregar ações:", error);
      toast.error("Erro ao carregar ações");
    }
  };

  const handleAddAction = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAttendance) return;

    try {
      const { error } = await supabase
        .from("attendance_actions")
        .insert([{
          ...actionFormData,
          attendance_id: selectedAttendance,
        }]);
      
      if (error) throw error;
      toast.success("Ação/Procedimento adicionado!");
      setActionFormData({
        professional_id: "",
        procedure_id: "",
        action_date: "",
        quantity: 1,
        notes: "",
      });
      loadActions(selectedAttendance);
    } catch (error: any) {
      console.error("Erro ao adicionar ação:", error);
      toast.error(error.message || "Erro ao adicionar ação");
    }
  };

  const handleDeleteAction = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta ação?")) return;

    try {
      const { error } = await supabase
        .from("attendance_actions")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Ação excluída!");
      if (selectedAttendance) loadActions(selectedAttendance);
    } catch (error) {
      console.error("Erro ao excluir ação:", error);
      toast.error("Erro ao excluir ação");
    }
  };

  const openActionsDialog = (attendanceId: string) => {
    setSelectedAttendance(attendanceId);
    loadActions(attendanceId);
    setShowActionsDialog(true);
  };

  const resetForm = () => {
    setFormData({
      patient_id: "",
      admission_date: "",
      month_reference: "",
      patient_origin: "01",
      cid_primary: "",
      cid_secondary1: "",
      cid_secondary2: "",
      cid_secondary3: "",
      esf_coverage: "N",
      esf_cnes: "",
      patient_destination: "00",
      homeless_situation: "N",
      drug_user: "N",
      drug_type: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Clipboard className="h-8 w-8 text-primary" />
        <h2 className="text-3xl font-bold tracking-tight">Registro de Atendimentos</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Identificação do Atendimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient_id">Paciente *</Label>
              <Select value={formData.patient_id} onValueChange={(value) => setFormData({ ...formData, patient_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um paciente..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} - {patient.cns || patient.cpf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admission_date">Data de Admissão *</Label>
                <Input
                  id="admission_date"
                  type="date"
                  value={formData.admission_date}
                  onChange={(e) => handleAdmissionDateChange(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="month_reference">Mês de Referência</Label>
                <Input
                  id="month_reference"
                  type="month"
                  value={formData.month_reference}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient_origin">Origem do Paciente *</Label>
                <Select value={formData.patient_origin} onValueChange={(value) => setFormData({ ...formData, patient_origin: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="01">01 - Demanda Espontânea</SelectItem>
                    <SelectItem value="02">02 - Atenção Básica</SelectItem>
                    <SelectItem value="03">03 - Serviço de Urgência</SelectItem>
                    <SelectItem value="04">04 - Outro CAPS</SelectItem>
                    <SelectItem value="05">05 - Hospital Dia</SelectItem>
                    <SelectItem value="06">06 - Hospital Psiquiátrico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CID - Classificação Internacional de Doenças</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cid_primary">CID Principal *</Label>
                <Input
                  id="cid_primary"
                  value={formData.cid_primary}
                  onChange={(e) => setFormData({ ...formData, cid_primary: e.target.value.toUpperCase() })}
                  maxLength={4}
                  placeholder="Ex: F200"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cid_secondary1">CID Secundário 1</Label>
                <Input
                  id="cid_secondary1"
                  value={formData.cid_secondary1}
                  onChange={(e) => setFormData({ ...formData, cid_secondary1: e.target.value.toUpperCase() })}
                  maxLength={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cid_secondary2">CID Secundário 2</Label>
                <Input
                  id="cid_secondary2"
                  value={formData.cid_secondary2}
                  onChange={(e) => setFormData({ ...formData, cid_secondary2: e.target.value.toUpperCase() })}
                  maxLength={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cid_secondary3">CID Secundário 3</Label>
                <Input
                  id="cid_secondary3"
                  value={formData.cid_secondary3}
                  onChange={(e) => setFormData({ ...formData, cid_secondary3: e.target.value.toUpperCase() })}
                  maxLength={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Situação e Destino</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="esf_coverage">Cobertura ESF? *</Label>
                <Select value={formData.esf_coverage} onValueChange={(value) => setFormData({ ...formData, esf_coverage: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="N">N - Não</SelectItem>
                    <SelectItem value="S">S - Sim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.esf_coverage === "S" && (
                <div className="space-y-2">
                  <Label htmlFor="esf_cnes">CNES da ESF</Label>
                  <Input
                    id="esf_cnes"
                    value={formData.esf_cnes}
                    onChange={(e) => setFormData({ ...formData, esf_cnes: e.target.value })}
                    maxLength={7}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="patient_destination">Destino do Paciente *</Label>
                <Select value={formData.patient_destination} onValueChange={(value) => setFormData({ ...formData, patient_destination: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="00">00 - Permanência</SelectItem>
                    <SelectItem value="01">01 - Continuidade em Outro CAPS</SelectItem>
                    <SelectItem value="02">02 - Continuidade na Atenção Básica</SelectItem>
                    <SelectItem value="03">03 - Alta</SelectItem>
                    <SelectItem value="04">04 - Óbito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="homeless_situation">Situação de Rua? *</Label>
                <Select value={formData.homeless_situation} onValueChange={(value) => setFormData({ ...formData, homeless_situation: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="N">N - Não</SelectItem>
                    <SelectItem value="S">S - Sim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="drug_user">Usuário de Drogas? *</Label>
                <Select value={formData.drug_user} onValueChange={(value) => setFormData({ ...formData, drug_user: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="N">N - Não</SelectItem>
                    <SelectItem value="S">S - Sim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.drug_user === "S" && (
                <div className="space-y-2">
                  <Label htmlFor="drug_type">Tipo de Droga</Label>
                  <Input
                    id="drug_type"
                    value={formData.drug_type}
                    onChange={(e) => setFormData({ ...formData, drug_type: e.target.value.toUpperCase() })}
                    maxLength={3}
                    placeholder="A=Álcool, C=Crack, O=Outros"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading} className="gap-2">
          <Plus className="h-4 w-4" />
          Registrar Atendimento
        </Button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Atendimentos Registrados</CardTitle>
          <CardDescription>Total: {attendances.length} atendimento(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Data Admissão</TableHead>
                <TableHead>Mês/Ano</TableHead>
                <TableHead>CID Principal</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nenhum atendimento registrado
                  </TableCell>
                </TableRow>
              ) : (
                attendances.map((attendance) => (
                  <TableRow key={attendance.id}>
                    <TableCell className="font-medium">{attendance.patients.name}</TableCell>
                    <TableCell>{new Date(attendance.admission_date).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{attendance.month_reference}</TableCell>
                    <TableCell className="font-mono">{attendance.cid_primary}</TableCell>
                    <TableCell>{attendance.patient_destination}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openActionsDialog(attendance.id)}
                          className="gap-2"
                        >
                          <Activity className="h-4 w-4" />
                          Procedimentos
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDeleteAttendance(attendance.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showActionsDialog} onOpenChange={setShowActionsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Procedimentos Realizados</DialogTitle>
            <DialogDescription>
              Adicione os procedimentos e profissionais que realizaram ações neste atendimento
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddAction} className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="professional_id">Profissional *</Label>
                <Select
                  value={actionFormData.professional_id}
                  onValueChange={(value) => setActionFormData({ ...actionFormData, professional_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {professionals.map((prof) => (
                      <SelectItem key={prof.id} value={prof.id}>
                        {prof.name} - {prof.cbo_description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="procedure_id">Procedimento *</Label>
                <Select
                  value={actionFormData.procedure_id}
                  onValueChange={(value) => setActionFormData({ ...actionFormData, procedure_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {procedures.map((proc) => (
                      <SelectItem key={proc.id} value={proc.id}>
                        {proc.sigtap_code} - {proc.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="action_date">Data do Procedimento *</Label>
                <Input
                  id="action_date"
                  type="date"
                  value={actionFormData.action_date}
                  onChange={(e) => setActionFormData({ ...actionFormData, action_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={actionFormData.quantity}
                  onChange={(e) => setActionFormData({ ...actionFormData, quantity: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Input
                id="notes"
                value={actionFormData.notes}
                onChange={(e) => setActionFormData({ ...actionFormData, notes: e.target.value })}
              />
            </div>
            <Button type="submit" className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Procedimento
            </Button>
          </form>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Procedimentos Registrados</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Procedimento</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhum procedimento registrado
                    </TableCell>
                  </TableRow>
                ) : (
                  actions.map((action) => (
                    <TableRow key={action.id}>
                      <TableCell>{new Date(action.action_date).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{action.professionals.name}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{action.procedures.description}</div>
                          <div className="text-xs text-muted-foreground">{action.procedures.sigtap_code}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{action.quantity}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDeleteAction(action.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
