import PageHeader from "@/components/common/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DietForm from "@/components/ai/diet-form";
import CostMinimizationForm from "@/components/ai/cost-minimization-form";
import ShoppingListForm from "@/components/ai/shopping-list-form";

export default function AIPage() {
  return (
    <div className="container mx-auto">
      <PageHeader
        title="AI Assistant"
        subtitle="Get smart suggestions for your family's health and budget."
      />
      
      <div className="px-4 sm:px-0">
        <Tabs defaultValue="diet" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="diet">Diet Chart</TabsTrigger>
            <TabsTrigger value="shopping">Shopping List</TabsTrigger>
            <TabsTrigger value="cost">Cost Minimization</TabsTrigger>
          </TabsList>
          <TabsContent value="diet">
            <DietForm />
          </TabsContent>
           <TabsContent value="shopping">
            <ShoppingListForm />
          </TabsContent>
          <TabsContent value="cost">
            <CostMinimizationForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
