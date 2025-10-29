import { useState } from "react";
import { AESResult, aesEncrypt, AESKeySize, stateToHex } from "@/lib/aes";
import AESInput from "@/components/AESInput";
import StateMatrix from "@/components/StateMatrix";
import RoundDetails from "@/components/RoundDetails";
import KeySchedule from "@/components/KeySchedule";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { toast } from "sonner";
import { Shield, ChevronRight } from "lucide-react";

const Index = () => {
  const [result, setResult] = useState<AESResult | null>(null);
  const [keySize, setKeySize] = useState<AESKeySize>(128);

  const handleEncrypt = (plaintext: string, key: string, selectedKeySize: AESKeySize) => {
    try {
      const encryptionResult = aesEncrypt(plaintext, key, selectedKeySize);
      setResult(encryptionResult);
      setKeySize(selectedKeySize);
      toast.success("Encryption completed successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Encryption failed");
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Shield className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              AES Encryption Visualizer
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Step-by-step visualization of AES-128, AES-192, and AES-256 encryption
          </p>
        </div>

        {/* Input Section */}
        <AESInput onEncrypt={handleEncrypt} />

        {/* Results Section */}
        {result && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Initial and Final States */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-secondary">
                <CardHeader>
                  <CardTitle className="text-secondary flex items-center gap-2">
                    Initial State
                    <ChevronRight className="w-5 h-5" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StateMatrix state={result.initialState} title="Input (Plaintext)" />
                </CardContent>
              </Card>

              <Card className="border-primary shadow-lg shadow-primary/20">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <ChevronRight className="w-5 h-5" />
                    Final State (Ciphertext)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StateMatrix state={result.finalState} title="Encrypted Output" highlight />
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Hex Output:</p>
                    <p className="font-mono text-primary break-all">{stateToHex(result.finalState)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Schedule */}
            <KeySchedule keySchedule={result.keySchedule} />

            {/* Round Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Round-by-Round Transformations</CardTitle>
                <p className="text-sm text-muted-foreground">
                  AES-{keySize} uses {result.rounds.length} rounds of transformation
                </p>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {result.rounds.map((round) => (
                    <RoundDetails key={round.round} roundState={round} />
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
