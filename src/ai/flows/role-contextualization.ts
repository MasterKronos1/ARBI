'use server';

/**
 * @fileOverview A role contextualization AI agent.
 *
 * - roleContextualization - A function that handles the role contextualization process.
 * - RoleContextualizationInput - The input type for the roleContextualization function.
 * - RoleContextualizationOutput - The return type for the roleContextualization function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RoleContextualizationInputSchema = z.object({
  userInput: z.string().describe('The user input.'),
  selectedRole: z.string().describe('The selected role (e.g., health advisor, finance expert).'),
});
export type RoleContextualizationInput = z.infer<typeof RoleContextualizationInputSchema>;

const RoleContextualizationOutputSchema = z.object({
  contextualizedInput: z.string().describe('The user input contextualized with the selected role.'),
});
export type RoleContextualizationOutput = z.infer<typeof RoleContextualizationOutputSchema>;

export async function roleContextualization(input: RoleContextualizationInput): Promise<RoleContextualizationOutput> {
  return roleContextualizationFlow(input);
}

const getRoleContext = ai.defineTool({
  name: 'getRoleContext',
  description: 'Retrieves the context for a given role.',
  inputSchema: z.object({
    role: z.string().describe('The role to retrieve context for.'),
  }),
  outputSchema: z.string(),
},
async (input) => {
  const roleContextMap: { [key: string]: string } = {
    'health advisor': 'You are a health advisor providing guidance on health and wellness.',
    'finance expert': 'You are a finance expert providing advice on financial matters.',
    'business consultant': 'You are a business consultant providing strategic business advice.',
  };

  return roleContextMap[input.role] || 'You are an assistant providing general information.';
});

const prompt = ai.definePrompt({
  name: 'roleContextualizationPrompt',
  input: { schema: RoleContextualizationInputSchema },
  output: { schema: RoleContextualizationOutputSchema },
  tools: [getRoleContext],
  prompt: `{{$roleContext := await getRoleContext role=selectedRole}}
  {{$roleContext}}
  User Input: {{{userInput}}}
  Please provide a contextualized response based on the user input and your role.
  `, // Using Handlebars syntax and calling getRoleContext tool.
});

const roleContextualizationFlow = ai.defineFlow(
  {
    name: 'roleContextualizationFlow',
    inputSchema: RoleContextualizationInputSchema,
    outputSchema: RoleContextualizationOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
