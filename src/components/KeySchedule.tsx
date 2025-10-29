import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StateMatrix from "./StateMatrix";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface KeyScheduleProps {
  keySchedule: number[][][];
}

const KeySchedule = ({ keySchedule }: KeyScheduleProps) => {
  return (
    <Card className="border-secondary">
      <CardHeader>
        <CardTitle className="text-xl text-secondary">Key Expansion Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {keySchedule.map((roundKey, index) => (
            <AccordionItem key={index} value={`key-${index}`}>
              <AccordionTrigger className="hover:text-secondary">
                {index === 0 ? "Initial Key" : `Round ${index} Key`}
              </AccordionTrigger>
              <AccordionContent>
                <StateMatrix
                  state={roundKey}
                  title={index === 0 ? "Initial Round Key" : `Round ${index} Key`}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default KeySchedule;
