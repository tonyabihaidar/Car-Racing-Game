import { RoundState } from "@/lib/aes";
import StateMatrix from "./StateMatrix";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface RoundDetailsProps {
  roundState: RoundState;
}

const RoundDetails = ({ roundState }: RoundDetailsProps) => {
  return (
    <AccordionItem value={`round-${roundState.round}`}>
      <AccordionTrigger className="text-lg font-semibold hover:text-primary">
        Round {roundState.round}
      </AccordionTrigger>
      <AccordionContent>
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base text-primary">Round {roundState.round} Transformations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <StateMatrix
                state={roundState.afterSubBytes}
                title="After SubBytes"
              />
              <StateMatrix
                state={roundState.afterShiftRows}
                title="After ShiftRows"
              />
              {roundState.afterMixColumns && (
                <StateMatrix
                  state={roundState.afterMixColumns}
                  title="After MixColumns"
                />
              )}
              <StateMatrix
                state={roundState.roundKey}
                title="Round Key"
              />
              <StateMatrix
                state={roundState.afterAddRoundKey}
                title="After AddRoundKey"
                highlight
              />
            </div>
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
};

export default RoundDetails;
