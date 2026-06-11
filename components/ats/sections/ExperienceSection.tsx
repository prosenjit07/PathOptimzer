"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, GripVertical, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { experienceData, getEmptyExperience } from "@/lib/ats/store";

type Responsibility = { id: string; text: string; selected: boolean };
type Experience = {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  responsibilities: Responsibility[];
  selected: boolean;
};

const ExperienceSection = () => {
  const [experience, setExperience] = useAtom(experienceData);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, type } = result;
    if (type === "experience") {
      const next = Array.from(experience);
      const [m] = next.splice(source.index, 1);
      next.splice(destination.index, 0, m);
      setExperience(next);
    } else if (type === "responsibility") {
      const next = [...experience];
      const src = next[parseInt(source.droppableId)];
      const dst = next[parseInt(destination.droppableId)];
      const [m] = src.responsibilities.splice(source.index, 1);
      dst.responsibilities.splice(destination.index, 0, m);
      setExperience(next);
    }
  };

  const add = () => setExperience([...experience, getEmptyExperience()]);
  const del = (i: number) => setExperience(experience.filter((_, idx) => idx !== i));
  const upd = (i: number, e: Experience) => {
    const next = [...experience];
    next[i] = e;
    setExperience(next);
  };
  const addResp = (i: number) => {
    const next = [...experience];
    next[i].responsibilities.push({ id: Date.now().toString(), text: "", selected: true });
    setExperience(next);
  };
  const updResp = (i: number, j: number, r: Responsibility) => {
    const next = [...experience];
    next[i].responsibilities[j] = r;
    setExperience(next);
  };
  const delResp = (i: number, j: number) => {
    const next = [...experience];
    next[i].responsibilities = next[i].responsibilities.filter((_, k) => k !== j);
    setExperience(next);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Experience</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="experiences" type="experience">
            {(p) => (
              <div {...p.droppableProps} ref={p.innerRef} className="space-y-4">
                {experience.map((e, i) => (
                  <Entry
                    key={e.id}
                    exp={e}
                    index={i}
                    update={upd}
                    del={del}
                    addResp={addResp}
                    updResp={updResp}
                    delResp={delResp}
                  />
                ))}
                {p.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <Button onClick={add}>
          <Plus className="mr-2 h-4 w-4" /> Add New Experience
        </Button>
      </CardContent>
    </Card>
  );
};

const Entry = ({
  exp,
  index,
  update,
  del,
  addResp,
  updResp,
  delResp,
}: {
  exp: Experience;
  index: number;
  update: (i: number, e: Experience) => void;
  del: (i: number) => void;
  addResp: (i: number) => void;
  updResp: (i: number, j: number, r: Responsibility) => void;
  delResp: (i: number, j: number) => void;
}) => {
  const [open, setOpen] = useState(true);
  return (
    <Draggable draggableId={exp.id} index={index}>
      {(provided) => {
        const { style, ...restDraggableProps } = provided.draggableProps;
        return (
        <div 
          ref={provided.innerRef} 
          {...restDraggableProps}
          style={style as React.CSSProperties}
        >
          <Card>
            <CardContent className="space-y-2 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div {...provided.dragHandleProps}>
                    <GripVertical className="text-gray-400" />
                  </div>
                  <Checkbox
                    checked={exp.selected}
                    onCheckedChange={(c) => update(index, { ...exp, selected: !!c })}
                  />
                  <Label>
                    {exp.company || "Company"} | {exp.position}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="icon" variant="ghost" onClick={() => setOpen((o) => !o)}>
                    {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => del(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {open && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Company</Label>
                      <Input value={exp.company} onChange={(e) => update(index, { ...exp, company: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Position</Label>
                      <Input value={exp.position} onChange={(e) => update(index, { ...exp, position: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Location</Label>
                    <Input value={exp.location} onChange={(e) => update(index, { ...exp, location: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Start date</Label>
                      <Input type="date" value={exp.startDate} onChange={(e) => update(index, { ...exp, startDate: e.target.value })} />
                    </div>
                    {!exp.isCurrent && (
                      <div className="space-y-1">
                        <Label>End date</Label>
                        <Input type="date" value={exp.endDate} onChange={(e) => update(index, { ...exp, endDate: e.target.value })} />
                      </div>
                    )}
                  </div>
                  <label className="flex items-center space-x-2 text-sm">
                    <Checkbox checked={exp.isCurrent} onCheckedChange={(c) => update(index, { ...exp, isCurrent: !!c })} />
                    <span>Current company</span>
                  </label>

                  <Droppable droppableId={index.toString()} type="responsibility">
                    {(p) => (
                      <div {...p.droppableProps} ref={p.innerRef} className="space-y-2">
                        {exp.responsibilities.map((r, j) => (
                          <Draggable key={r.id} draggableId={`${index}-${r.id}`} index={j}>
                            {(rp) => {
                              const { style: rStyle, ...restRDraggableProps } = rp.draggableProps;
                              return (
                              <div 
                                ref={rp.innerRef} 
                                {...restRDraggableProps}
                                style={rStyle as React.CSSProperties}
                                className="flex items-center space-x-2"
                              >
                                <div {...rp.dragHandleProps}>
                                  <GripVertical className="text-gray-400" />
                                </div>
                                <Checkbox
                                  checked={r.selected}
                                  onCheckedChange={(c) => updResp(index, j, { ...r, selected: !!c })}
                                />
                                <Textarea
                                  value={r.text}
                                  onChange={(e) => updResp(index, j, { ...r, text: e.target.value })}
                                  placeholder="Responsibility / achievement"
                                />
                                <Button size="icon" variant="destructive" onClick={() => delResp(index, j)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              );
                            }}
                          </Draggable>
                        ))}
                        {p.placeholder}
                      </div>
                    )}
                  </Droppable>

                  <Button onClick={() => addResp(index)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Responsibility
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        );
      }}
    </Draggable>
  );
};

export default ExperienceSection;
