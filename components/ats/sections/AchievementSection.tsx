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
import { achievementData, getEmptyAchievement } from "@/lib/ats/store";

type Responsibility = { id: string; text: string; selected: boolean };
type Achievement = {
  id: string;
  competition: string;
  position: string;
  location: string;
  date: string;
  responsibilities: Responsibility[];
  selected: boolean;
};

const AchievementSection = () => {
  const [achievement, setAchievement] = useAtom(achievementData);
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, type } = result;
    if (type === "achievement") {
      const next = Array.from(achievement);
      const [m] = next.splice(source.index, 1);
      next.splice(destination.index, 0, m);
      setAchievement(next);
    } else if (type === "responsibility") {
      const next = [...achievement];
      const src = next[parseInt(source.droppableId)];
      const dst = next[parseInt(destination.droppableId)];
      const [m] = src.responsibilities.splice(source.index, 1);
      dst.responsibilities.splice(destination.index, 0, m);
      setAchievement(next);
    }
  };

  const add = () => setAchievement([...achievement, getEmptyAchievement()]);
  const del = (i: number) =>
    setAchievement(achievement.filter((_, idx) => idx !== i));
  const upd = (i: number, a: Achievement) => {
    const next = [...achievement];
    next[i] = a;
    setAchievement(next);
  };
  const addR = (i: number) => {
    const next = [...achievement];
    next[i].responsibilities.push({ id: Date.now().toString(), text: "", selected: true });
    setAchievement(next);
  };
  const updR = (i: number, j: number, r: Responsibility) => {
    const next = [...achievement];
    next[i].responsibilities[j] = r;
    setAchievement(next);
  };
  const delR = (i: number, j: number) => {
    const next = [...achievement];
    next[i].responsibilities = next[i].responsibilities.filter((_, k) => k !== j);
    setAchievement(next);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="achievements" type="achievement">
            {(p) => (
              <div {...p.droppableProps} ref={p.innerRef} className="space-y-4">
                {achievement.map((a, i) => (
                  <Entry
                    key={a.id}
                    ach={a}
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
          <Plus className="mr-2 h-4 w-4" /> Add Achievement
        </Button>
      </CardContent>
    </Card>
  );
};

const Entry = ({
  ach,
  index,
  update,
  del,
  addR,
  updR,
  delR,
}: {
  ach: Achievement;
  index: number;
  update: (i: number, a: Achievement) => void;
  del: (i: number) => void;
  addR: (i: number) => void;
  updR: (i: number, j: number, r: Responsibility) => void;
  delR: (i: number, j: number) => void;
}) => {
  const [open, setOpen] = useState(true);
  return (
    <Draggable draggableId={ach.id} index={index}>
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
                    checked={ach.selected}
                    onCheckedChange={(c) => update(index, { ...ach, selected: !!c })}
                  />
                  <Label>{ach.competition || "Competition"} | {ach.position}</Label>
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
                      <Label>Competition</Label>
                      <Input value={ach.competition} onChange={(e) => update(index, { ...ach, competition: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Position</Label>
                      <Input value={ach.position} onChange={(e) => update(index, { ...ach, position: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Location</Label>
                    <Input value={ach.location} onChange={(e) => update(index, { ...ach, location: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>Date</Label>
                    <Input type="date" value={ach.date} onChange={(e) => update(index, { ...ach, date: e.target.value })} />
                  </div>

                  <Droppable droppableId={index.toString()} type="responsibility">
                    {(p) => (
                      <div {...p.droppableProps} ref={p.innerRef} className="space-y-2">
                        {ach.responsibilities.map((r, j) => (
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
                                  onCheckedChange={(c) => updR(index, j, { ...r, selected: !!c })}
                                />
                                <Textarea
                                  value={r.text}
                                  onChange={(e) => updR(index, j, { ...r, text: e.target.value })}
                                  placeholder="Highlight / result"
                                />
                                <Button size="icon" variant="destructive" onClick={() => delR(index, j)}>
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
                  <Button onClick={() => addR(index)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Highlight
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

export default AchievementSection;
