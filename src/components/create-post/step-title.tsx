import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PostData } from "./types";

interface StepTitleProps {
  data: PostData;
  setData: React.Dispatch<React.SetStateAction<PostData>>;
}

export function StepTitle({ data, setData }: StepTitleProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          Title
        </Label>
        <Input
          id="title"
          placeholder="Give your post a title"
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          className="h-11 bg-[#fafafa] border-border focus:bg-white transition-colors"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Description
          <span className="ml-1 text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          id="description"
          placeholder="What's this post about?"
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          rows={4}
          className="bg-[#fafafa] border-border focus:bg-white transition-colors resize-none"
        />
      </div>
    </div>
  );
}
