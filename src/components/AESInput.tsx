import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AESKeySize } from "@/lib/aes";
import { Lock } from "lucide-react";

interface AESInputProps {
  onEncrypt: (plaintext: string, key: string, keySize: AESKeySize) => void;
}

const AESInput = ({ onEncrypt }: AESInputProps) => {
  const [plaintext, setPlaintext] = useState("00112233445566778899aabbccddeeff");
  const [key, setKey] = useState("000102030405060708090a0b0c0d0e0f");
  const [keySize, setKeySize] = useState<AESKeySize>(128);

  const handleEncrypt = () => {
    try {
      onEncrypt(plaintext, key, keySize);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Encryption error");
    }
  };

  const getRequiredKeyLength = () => {
    return keySize / 4; // Hex characters needed
  };

  return (
    <Card className="border-primary/50 shadow-lg shadow-primary/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="w-6 h-6 text-primary" />
          <CardTitle className="text-2xl">AES Encryption Input</CardTitle>
        </div>
        <CardDescription>
          Enter your message and key in hexadecimal format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="keysize">Key Size</Label>
          <Select
            value={keySize.toString()}
            onValueChange={(value) => setKeySize(parseInt(value) as AESKeySize)}
          >
            <SelectTrigger id="keysize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="128">AES-128 (128 bits)</SelectItem>
              <SelectItem value="192">AES-192 (192 bits)</SelectItem>
              <SelectItem value="256">AES-256 (256 bits)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="plaintext">Plaintext (32 hex characters / 16 bytes)</Label>
          <Input
            id="plaintext"
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value.replace(/[^0-9a-fA-F]/g, ''))}
            placeholder="00112233445566778899aabbccddeeff"
            className="font-mono"
            maxLength={32}
          />
          <p className="text-xs text-muted-foreground">
            {plaintext.length} / 32 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="key">Key ({getRequiredKeyLength()} hex characters / {keySize / 8} bytes)</Label>
          <Input
            id="key"
            value={key}
            onChange={(e) => setKey(e.target.value.replace(/[^0-9a-fA-F]/g, ''))}
            placeholder="000102030405060708090a0b0c0d0e0f"
            className="font-mono"
            maxLength={getRequiredKeyLength()}
          />
          <p className="text-xs text-muted-foreground">
            {key.length} / {getRequiredKeyLength()} characters
          </p>
        </div>

        <Button
          onClick={handleEncrypt}
          className="w-full"
          size="lg"
          disabled={plaintext.length !== 32 || key.length !== getRequiredKeyLength()}
        >
          Encrypt
        </Button>
      </CardContent>
    </Card>
  );
};

export default AESInput;
