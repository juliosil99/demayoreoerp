
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
}

interface AccordionDemoProps {
  navigationItems: NavigationItem[];
}

export function AccordionDemo({ navigationItems }: AccordionDemoProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="navigation">
        <AccordionTrigger className="px-4 py-2 hover:bg-muted/50">
          Navegación
        </AccordionTrigger>
        <AccordionContent>
          <nav className="space-y-1 px-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
