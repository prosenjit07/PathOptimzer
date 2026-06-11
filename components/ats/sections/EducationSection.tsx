"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, GripVertical, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { educationData, getEmptyEducation } from "@/lib/ats/store";

type Responsibility = { id: string; text: string; selected: boolean };
type Education = {
  id: string;
  institution: string;
  location: string;
  degree: string;
  result: string;
  responsibilities: Responsibility[];
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  selected: boolean;
};

const EducationSection = () => {
  const [education, setEducation] = useAtom(educationData);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, type } = result;
    if (type === "education") {
      const next = Array.from(education);
      const [moved] = next.splice(source.index, 1);
      next.splice(destination.index, 0, moved);
      setEducation(next);
    } else if (type === "responsibility") {
      const next = [...education];
      const src = next[parseInt(source.droppableId)];
      const dst = next[parseInt(destination.droppableId)];
      const [moved] = src.responsibilities.splice(source.index, 1);
      dst.responsibilities.splice(destination.index, 0, moved);
      setEducation(next);
    }
  };

  const addEducation = () => setEducation([...education, getEmptyEducation()]);
  const deleteEducation = (i: number) =>
    setEducation(education.filter((_, idx) => idx !== i));
  const updateEducation = (i: number, upd: Education) => {
    const next = [...education];
    next[i] = upd;
    setEducation(next);
  };
  const addResponsibility = (i: number) => {
    const next = [...education];
    next[i].responsibilities.push({
      id: Date.now().toString(),
      text: "",
      selected: true,
    });
    setEducation(next);
  };
  const updateResponsibility = (
    i: number,
    j: number,
    upd: Responsibility
  ) => {
    const next = [...education];
    next[i].responsibilities[j] = upd;
    setEducation(next);
  };
  const deleteResponsibility = (i: number, j: number) => {
    const next = [...education];
    next[i].responsibilities = next[i].responsibilities.filter(
      (_, k) => k !== j
    );
    setEducation(next);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Education</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="educations" type="education">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {education.map((edu, index) => (
                  <EducationEntry
                    key={edu.id}
                    edu={edu}
                    index={index}
                    updateEducation={updateEducation}
                    deleteEducation={deleteEducation}
                    addResponsibility={addResponsibility}
                    updateResponsibility={updateResponsibility}
                    deleteResponsibility={deleteResponsibility}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <Button onClick={addEducation}>
          <Plus className="mr-2 h-4 w-4" /> Add New Education
        </Button>
      </CardContent>
    </Card>
  );
};

const EducationEntry = ({
  edu,
  index,
  updateEducation,
  deleteEducation,
  addResponsibility,
  updateResponsibility,
  deleteResponsibility,
}: {
  edu: Education;
  index: number;
  updateEducation: (i: number, e: Education) => void;
  deleteEducation: (i: number) => void;
  addResponsibility: (i: number) => void;
  updateResponsibility: (i: number, j: number, r: Responsibility) => void;
  deleteResponsibility: (i: number, j: number) => void;
}) => {
  const [open, setOpen] = useState(true);
  return (
    <Draggable draggableId={edu.id} index={index}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps}>
          <Card>
            <CardContent className="space-y-2 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div {...provided.dragHandleProps}>
                    <GripVertical className="text-gray-400" />
                  </div>
                  <Checkbox
                    checked={edu.selected}
                    onCheckedChange={(c) =>
                      updateEducation(index, { ...edu, selected: !!c })
                    }
                    id={`edu-select-${index}`}
                  />
                  <Label>
                    {edu.institution || "Institution Name"} | {edu.degree}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setOpen((o) => !o)}
                  >
                    {open ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => deleteEducation(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {open && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor={`edu-institution-${index}`}>Institution</Label>
                    <Input
                      id={`edu-institution-${index}`}
                      value={edu.institution}
                      onChange={(e) =>
                        updateEducation(index, { ...edu, institution: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor={`edu-degree-${index}`}>Degree</Label>
                      <Input
                        id={`edu-degree-${index}`}
                        value={edu.degree}
                        onChange={(e) =>
                          updateEducation(index, { ...edu, degree: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`edu-result-${index}`}>Result / GPA</Label>
                      <Input
                        id={`edu-result-${index}`}
                        value={edu.result}
                        onChange={(e) =>
                          updateEducation(index, { ...edu, result: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`edu-location-${index}`}>Location</Label>
                    <Input
                      id={`edu-location-${index}`}
                      value={edu.location}
                      onChange={(e) =>
                        updateEducation(index, { ...edu, location: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor={`edu-startDate-${index}`}>Start date</Label>
                      <Input
                        id={`edu-startDate-${index}`}
                        type="date"
                        value={edu.startDate}
                        onChange={(e) =>
                          updateEducation(index, { ...edu, startDate: e.target.value })
                        }
                      />
                    </div>
                    {!edu.isCurrent && (
                      <div className="space-y-1">
                        <Label htmlFor={`edu-endDate-${index}`}>End date</Label>
                        <Input
                          id={`edu-endDate-${index}`}
                          type="date"
                          value={edu.endDate}
                          onChange={(e) =>
                            updateEducation(index, { ...edu, endDate: e.target.value })
                          }
                        />
                      </div>
                    )}
                  </div>
                  <label className="flex items-center space-x-2 text-sm">
                    <Checkbox
                      checked={edu.isCurrent}
                      onCheckedChange={(c) =>
                        updateEducation(index, { ...edu, isCurrent: !!c })
                      }
                      id={`edu-current-${index}`}
                    />
                    <span>Current institution</span>
                  </label>

                  <Droppable droppableId={index.toString()} type="responsibility">
                    {(p) => (
                      <div {...p.droppableProps} ref={p.innerRef} className="space-y-2">
                        {edu.responsibilities.map((r, j) => (
                          <Draggable
                            draggableId={`${index}-${r.id}`}
                            index={j}
                            key={r.id}
                          >
                            {(rp) => (
                              <div
                                ref={rp.innerRef}
                                {...rp.draggableProps}
                                className="flex items-center space-x-2"
                              >
                                <div {...rp.dragHandleProps}>
                                  <GripVertical className="text-gray-400" />
                                </div>
                                <Checkbox
                                  checked={r.selected}
                                  onCheckedChange={(c) =>
                                    updateResponsibility(index, j, {
                                      ...r,
                                      selected: !!c,
                                    })
                                  }
                                />
                                <Textarea
                                  value={r.text}
                                  onChange={(e) =>
                                    updateResponsibility(index, j, {
                                      ...r,
                                      text: e.target.value,
                                    })
                                  }
                                  placeholder="Course / Highlight"
                                />
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  onClick={() => deleteResponsibility(index, j)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {p.placeholder}
                      </div>
                    )}
                  </Droppable>

                  <Button onClick={() => addResponsibility(index)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Highlight
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

export default EducationSection;
