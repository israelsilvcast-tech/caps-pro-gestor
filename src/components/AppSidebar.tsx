import { Users, Stethoscope, Clipboard, FileDown, UserCog, Home } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Início", url: "/", icon: Home },
  { title: "Pacientes", url: "/pacientes", icon: Users },
  { title: "Profissionais", url: "/profissionais", icon: UserCog },
  { title: "Procedimentos", url: "/procedimentos", icon: Stethoscope },
  { title: "Atendimentos", url: "/atendimentos", icon: Clipboard },
  { title: "Exportação", url: "/exportacao", icon: FileDown },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="px-4 py-6">
          <h2 className="text-lg font-bold text-sidebar-foreground">RAAS</h2>
          <p className="text-xs text-sidebar-foreground/70">CAPS 3 DR BACELAR VIANA</p>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "flex items-center gap-3 rounded-lg px-3 py-2 bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
