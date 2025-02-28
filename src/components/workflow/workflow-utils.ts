
import { WorkflowStep } from "@/types/workflow";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

export const generateInitialStep = (): WorkflowStep => {
  return {
    id: 'start',
    label: 'התחלה',
    type: 'task',
    description: ''
  };
};

export const createNewStep = (steps: WorkflowStep[]): WorkflowStep => {
  return {
    id: `step-${crypto.randomUUID()}`,
    label: `שלב ${steps.length + 1}`,
    type: 'task',
    description: ''
  };
};

export const findStepById = (steps: WorkflowStep[], stepId: string): WorkflowStep | null => {
  for (const step of steps) {
    if (step.id === stepId) {
      return step;
    }
    if (step.children) {
      const found = findStepById(step.children, stepId);
      if (found) return found;
    }
  }
  return null;
};

export const updateStepInList = (steps: WorkflowStep[], stepId: string, updates: Partial<WorkflowStep>): WorkflowStep[] => {
  return steps.map(step => {
    if (step.id === stepId) {
      return { ...step, ...updates };
    }
    if (step.children) {
      return { ...step, children: updateStepInList(step.children, stepId, updates) };
    }
    return step;
  });
};

export const toggleCollapseStep = (steps: WorkflowStep[], stepId: string): WorkflowStep[] => {
  return steps.map(step => {
    if (step.id === stepId) {
      return { ...step, isCollapsed: !step.isCollapsed };
    }
    if (step.children) {
      return { ...step, children: toggleCollapseStep(step.children, stepId) };
    }
    return step;
  });
};

export const addChildStepsToParent = (steps: WorkflowStep[], parentId: string): WorkflowStep[] => {
  return steps.map(step => {
    if (step.id === parentId) {
      const branch1: WorkflowStep = {
        id: `${step.id}-1`,
        label: 'תוצאה 1',
        type: 'task',
        description: ''
      };
      const branch2: WorkflowStep = {
        id: `${step.id}-2`,
        label: 'תוצאה 2',
        type: 'task',
        description: ''
      };
      return {
        ...step,
        children: [branch1, branch2]
      };
    }
    if (step.children) {
      return { ...step, children: addChildStepsToParent(step.children, parentId) };
    }
    return step;
  });
};

export const deleteStepById = (steps: WorkflowStep[], stepId: string): WorkflowStep[] => {
  return steps.filter(step => {
    if (step.id === stepId) {
      return false;
    }
    if (step.children) {
      step.children = deleteStepById(step.children, stepId);
    }
    return true;
  });
};

export const addStepToParent = (steps: WorkflowStep[], newStep: WorkflowStep, parentStepId?: string): WorkflowStep[] => {
  if (!parentStepId) {
    return [...steps, newStep];
  }

  return steps.map(step => {
    if (step.id === parentStepId) {
      return {
        ...step,
        children: step.children ? [...step.children, newStep] : [newStep]
      };
    }
    if (step.children) {
      return { ...step, children: addStepToParent(step.children, newStep, parentStepId) };
    }
    return step;
  });
};

export const generatePDF = async (workflowName: string, steps: WorkflowStep[]): Promise<void> => {
  try {
    const container = document.createElement('div');
    container.style.width = '800px';
    container.style.padding = '40px';
    container.style.position = 'absolute';
    container.style.left = '50%';
    container.style.transform = 'translateX(-50%)';
    container.style.backgroundColor = '#ffffff';
    container.dir = 'rtl';
    document.body.appendChild(container);

    const content = document.createElement('div');
    content.style.fontFamily = 'Heebo, Arial, sans-serif';
    content.style.maxWidth = '720px';
    content.style.margin = '0 auto';
    container.appendChild(content);

    const header = document.createElement('div');
    header.style.marginBottom = '30px';
    header.style.borderBottom = '2px solid #6b46c1';
    header.style.paddingBottom = '20px';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    content.appendChild(header);

    const title = document.createElement('h1');
    title.style.fontSize = '28px';
    title.style.color = '#6b46c1';
    title.style.margin = '0';
    title.textContent = workflowName || 'זרימת עבודה';
    
    const date = document.createElement('div');
    date.style.color = '#666';
    date.style.fontSize = '14px';
    date.textContent = format(new Date(), 'dd/MM/yyyy');
    
    header.appendChild(title);
    header.appendChild(date);

    const summary = document.createElement('div');
    summary.style.backgroundColor = '#f8f9fa';
    summary.style.padding = '15px';
    summary.style.borderRadius = '8px';
    summary.style.marginBottom = '30px';
    summary.style.fontSize = '14px';
    summary.style.color = '#4a5568';
    summary.style.textAlign = 'center';
    summary.textContent = `סה"כ שלבים: ${steps.length}`;
    content.appendChild(summary);

    const renderStepForPDF = (step: WorkflowStep, level: number = 0): HTMLDivElement => {
      const stepElement = document.createElement('div');
      stepElement.style.width = '100%';
      stepElement.style.maxWidth = '600px';
      stepElement.style.margin = '0 auto 20px auto';
      stepElement.style.padding = '24px';
      stepElement.style.borderRadius = '12px';
      stepElement.style.backgroundColor = '#ffffff';
      stepElement.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      stepElement.style.border = '1px solid #e2e8f0';
      stepElement.style.position = 'relative';
      content.appendChild(stepElement);

      const stepHeader = document.createElement('div');
      stepHeader.style.display = 'flex';
      stepHeader.style.alignItems = 'center';
      stepHeader.style.gap = '12px';
      stepHeader.style.marginBottom = '16px';
      stepHeader.style.padding = '12px 0';
      stepElement.appendChild(stepHeader);

      const stepNumber = document.createElement('div');
      stepNumber.style.backgroundColor = '#6b46c1';
      stepNumber.style.color = '#ffffff';
      stepNumber.style.padding = '6px 12px';
      stepNumber.style.borderRadius = '6px';
      stepNumber.style.fontSize = '14px';
      stepNumber.style.fontWeight = 'bold';
      stepNumber.style.minWidth = '32px';
      stepNumber.style.textAlign = 'center';
      stepNumber.textContent = `${level + 1}`;
      stepHeader.appendChild(stepNumber);

      const stepTitle = document.createElement('div');
      stepTitle.style.flex = '1';
      stepTitle.style.fontWeight = 'bold';
      stepTitle.style.fontSize = '18px';
      stepTitle.style.color = '#2d3748';
      stepTitle.textContent = step.label;
      stepHeader.appendChild(stepTitle);

      const stepType = document.createElement('div');
      stepType.style.color = '#718096';
      stepType.style.fontSize = '12px';
      stepType.style.padding = '4px 10px';
      stepType.style.backgroundColor = '#f7fafc';
      stepType.style.borderRadius = '4px';
      stepType.style.whiteSpace = 'nowrap';
      stepType.textContent = step.type;
      stepHeader.appendChild(stepType);

      if (step.description) {
        const description = document.createElement('div');
        description.style.margin = '16px 0';
        description.style.color = '#4a5568';
        description.style.fontSize = '14px';
        description.style.lineHeight = '1.5';
        description.style.padding = '12px';
        description.style.backgroundColor = '#f8fafc';
        description.style.borderRadius = '6px';
        description.textContent = step.description;
        stepElement.appendChild(description);
      }

      const metadata = document.createElement('div');
      metadata.style.display = 'flex';
      metadata.style.gap = '16px';
      metadata.style.marginTop = '16px';
      metadata.style.padding = '12px 0';
      metadata.style.borderTop = '1px solid #e2e8f0';
      metadata.style.color = '#718096';
      metadata.style.fontSize = '13px';
      stepElement.appendChild(metadata);

      if (step.duration) {
        const duration = document.createElement('div');
        duration.style.display = 'flex';
        duration.style.alignItems = 'center';
        duration.style.gap = '4px';
        duration.textContent = `משך: ${step.duration} דקות`;
        metadata.appendChild(duration);
      }

      return stepElement;
    };

    const renderWorkflowSteps = (steps: WorkflowStep[], level: number = 0): void => {
      steps.forEach(step => {
        const stepContainer = document.createElement('div');
        stepContainer.style.display = 'flex';
        stepContainer.style.flexDirection = 'column';
        stepContainer.style.alignItems = 'center';
        stepContainer.style.width = '100%';
        
        content.appendChild(stepContainer);
        
        const stepElement = renderStepForPDF(step, level);
        stepContainer.appendChild(stepElement);

        if (step.children) {
          const childrenContainer = document.createElement('div');
          childrenContainer.style.width = '100%';
          childrenContainer.style.maxWidth = '600px';
          childrenContainer.style.margin = '0 auto';
          childrenContainer.style.paddingRight = '40px';
          childrenContainer.style.borderRight = '2px solid #e2e8f0';
          
          content.appendChild(childrenContainer);
          
          step.children.forEach(childStep => {
            renderWorkflowSteps([childStep], level + 1);
          });
        }
      });
    };

    renderWorkflowSteps(steps);
    container.appendChild(content);

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: container.offsetWidth,
      height: container.offsetHeight
    });

    document.body.removeChild(container);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4',
      hotfixes: ['px_scaling']
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let position = 20;

    while (position < imgHeight) {
      if (position > 20) {
        pdf.addPage();
      }
      
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 1.0),
        'JPEG',
        20,
        position === 20 ? 20 : -position + 20,
        imgWidth,
        imgHeight
      );
      
      position += pageHeight - 40;
    }

    pdf.save(`${workflowName || 'workflow'}.pdf`);
    return Promise.resolve();

  } catch (error) {
    console.error('Error generating PDF:', error);
    return Promise.reject(error);
  }
};
