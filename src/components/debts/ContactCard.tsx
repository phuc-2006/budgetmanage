import { User, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContactWithBalance } from '@/types/debt';
import { formatCurrency } from '@/lib/format';
import { useDebts } from '@/hooks/useDebts';

interface ContactCardProps {
  contact: ContactWithBalance;
  onClick?: () => void;
}

export function ContactCard({ contact, onClick }: ContactCardProps) {
  const { deleteContact } = useDebts();

  return (
    <Card 
      className="glass cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{contact.name}</p>
              <p className={`text-sm font-medium ${contact.balance >= 0 ? 'text-income' : 'text-expense'}`}>
                {contact.balance >= 0 ? 'Họ nợ: ' : 'Mình nợ: '}
                {formatCurrency(Math.abs(contact.balance))}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              deleteContact.mutate(contact.id);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
