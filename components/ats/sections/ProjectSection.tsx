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
import { projectData, getEmptyProject } from "@/lib/ats/store";

type Responsibility = { id: string; text: string; selected: boolean };
type Project = {
  id: string;
  name: string;
  link: string;
  stack: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  responsibilities: Responsibility[];
  selected: boolean;
};

const ProjectSection = () => {
  const [project, setProject] = useAtom(projectData);
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, type } = result;
    if (type === "project") {
      const next = Array.from(project);
      const [m] = next.splice(source.index, 1);
      next.splice(destination.index, 0, m);
      setProject(next);
    } else if (type === "responsibility") {
      const next = [...project];
      const src = next[parseInt(source.droppableId)];
      const dst = next[parseInt(destination.droppableId)];
      const [m] = src.responsibilities.splice(source.index, 1);
      dst.responsibilities.splice(destination.index, 0, m);
      setProject(next);
    }
  };

  const add = () => setProject([...project, getEmptyProject()]);
  const del = (i: number) => setProject(project.filter((_, idx) => idx !== i));
  const upd = (i: number, p: Project) => {
    const next = [...project];
    next[i] = p;
    setProject(next);
  };
  const addR = (i: number) => {
    const next = [...project];
    next[i].responsibilities.push({ id: Date.now().toString(), text: "", selected: true });
    setProject(next);
  };
  const updR = (i: number, j: number, r: Responsibility) => {
    const next = [...project];
    next[i].responsibilities[j] = r;
    setProject(next);
  };
  const delR = (i: number, j: number) => {
    const next = [...project];
    next[i].responsibilities = next[i].responsibilities.filter((_, k) => k !== j);
    setProject(next);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="projects" type="project">
            {(p) => (
              <div {...p.droppableProps} ref={p.innerRef} className="space-y-4">
                {project.map((pr, i) => (
                  <Entry
                    key={pr.id}
                    proj={pr}
                    index={i}
                    update={upd}
                    del={del}
                    addR={addR}
                    updR={updR}
                    delR={delR}
                  />
                ))}
                {p.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <Button onClick={add}>
          <Plus className="mr-2 h-4 w-4" /> Add New Project
        </Button>
      </CardContent>
    </Card>
  );
};

const Entry = ({
  proj,
  index,
  update,
  del,
  addR,
  updR,
  delR,
}: {
  proj: Project;
  index: number;
  update: (i: number, p: Project) => void;
  del: (i: number) => void;
  addR: (i: number) => void;
  updR: (i: number, j: number, r: Responsibility) => void;
  delR: (i: number, j: number) => void;
}) => {
  const [open, setOpen] = useState(true);
  return (
    <Draggable draggableId={proj.id} index={index}>
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
                    checked={proj.selected}
                    onCheckedChange={(c) => update(index, { ...proj, selected: !!c })}
                  />
                  <Label>{proj.name || "Project Name"}</Label>
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
                      <Label>Name</Label>
                      <Input value={proj.name} onChange={(e) => update(index, { ...proj, name: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Stack</Label>
                      <Input value={proj.stack} onChange={(e) => update(index, { ...proj, stack: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Link</Label>
                    <Input value={proj.link} onChange={(e) => update(index, { ...proj, link: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Start date</Label>
                      <Input type="date" value={proj.startDate} onChange={(e) => update(index, { ...proj, startDate: e.target.value })} />
                    </div>
                    {!proj.isCurrent && (
                      <div className="space-y-1">
                        <Label>End date</Label>
                        <Input type="date" value={proj.endDate} onChange={(e) => update(index, { ...proj, endDate: e.target.value })} />
                      </div>
                    )}
                  </div>
                  <label className="flex items-center space-x-2 text-sm">
                    <Checkbox checked={proj.isCurrent} onCheckedChange={(c) => update(index, { ...proj, isCurrent: !!c })} />
                    <span>Current project</span>
                  </label>

                  <Droppable droppableId={index.toString()} type="responsibility">
                    {(p) => (
                      <div {...p.droppableProps} ref={p.innerRef} className="space-y-2">
                        {proj.responsibilities.map((r, j) => (
                          <Draggable key={r.id} draggableId={`${index}-${r.id}`} index={j}>
                            {(rp) => (
                              <div ref={rp.innerRef} {...rp.draggableProps} className="flex items-center space-x-2">
                                <div {...rp.dragHandleProps}>
                                  <GripVertical className="text-gray-400" />
                                </div>
                                <Checkbox
                                  checked={r.selected}
                                  onCheckedChange={(c) => updR(index, j, { ...r, selected: !!c })}
                                />
                                <Textarea
                                  value={r.text}
                                  onChange={(e) => updR(index, j, { ...r, text: e.target.value })}
                                  placeholder="Responsibility / highlight"
                                />
                                <Button size="icon" variant="destructive" onClick={() => delR(index, j)}>
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

                  <Button onClick={() => addR(index)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Responsibility
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

export default ProjectSection;
