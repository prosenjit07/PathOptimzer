"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, GripVertical, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { skillData, getEmptySkill } from "@/lib/ats/store";

type Skill = { id: string; name: string; selected: boolean };
type SkillCategory = {
  id: string;
  title: string;
  skills: Skill[];
  selected: boolean;
};

const SkillSection = () => {
  const [categories, setCategories] = useAtom(skillData);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, type } = result;
    if (type === "category") {
      const next = Array.from(categories);
      const [m] = next.splice(source.index, 1);
      next.splice(destination.index, 0, m);
      setCategories(next);
    } else if (type === "skill") {
      const categoryIndex = parseInt(source.droppableId.split("-")[1]);
      const next = [...categories];
      const [m] = next[categoryIndex].skills.splice(source.index, 1);
      next[categoryIndex].skills.splice(destination.index, 0, m);
      setCategories(next);
    }
  };

  const addCategory = () => setCategories([...categories, getEmptySkill()]);
  const updateCategory = (i: number, c: SkillCategory) => {
    const next = [...categories];
    next[i] = c;
    setCategories(next);
  };
  const deleteCategory = (i: number) =>
    setCategories(categories.filter((_, idx) => idx !== i));
  const addSkill = (i: number) => {
    const next = [...categories];
    next[i].skills.push({ id: Date.now().toString(), name: "", selected: true });
    setCategories(next);
  };
  const updateSkill = (i: number, j: number, s: Skill) => {
    const next = [...categories];
    next[i].skills[j] = s;
    setCategories(next);
  };
  const deleteSkill = (i: number, j: number) => {
    const next = [...categories];
    next[i].skills = next[i].skills.filter((_, k) => k !== j);
    setCategories(next);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="categories" type="category">
            {(p) => (
              <div
                {...p.droppableProps}
                ref={p.innerRef}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {categories.map((c, i) => (
                  <Category
                    key={c.id}
                    category={c}
                    index={i}
                    update={updateCategory}
                    del={deleteCategory}
                    addSkill={addSkill}
                    updateSkill={updateSkill}
                    deleteSkill={deleteSkill}
                  />
                ))}
                {p.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <Button onClick={addCategory}>
          <Plus className="mr-2 h-4 w-4" /> Add New Category
        </Button>
      </CardContent>
    </Card>
  );
};

const Category = ({
  category,
  index,
  update,
  del,
  addSkill,
  updateSkill,
  deleteSkill,
}: {
  category: SkillCategory;
  index: number;
  update: (i: number, c: SkillCategory) => void;
  del: (i: number) => void;
  addSkill: (i: number) => void;
  updateSkill: (i: number, j: number, s: Skill) => void;
  deleteSkill: (i: number, j: number) => void;
}) => {
  const [open, setOpen] = useState(true);
  return (
    <Draggable draggableId={category.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="mb-4 w-full"
        >
          <Card>
            <CardContent className="space-y-2 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1">
                  <div {...provided.dragHandleProps}>
                    <GripVertical className="text-gray-400" />
                  </div>
                  <Checkbox
                    checked={category.selected}
                    onCheckedChange={(c) =>
                      update(index, { ...category, selected: !!c })
                    }
                  />
                  <Input
                    placeholder="Category title"
                    value={category.title}
                    onChange={(e) =>
                      update(index, { ...category, title: e.target.value })
                    }
                    className="font-medium"
                  />
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
                  <Droppable droppableId={`category-${index}`} type="skill">
                    {(p) => (
                      <div {...p.droppableProps} ref={p.innerRef} className="space-y-2">
                        {category.skills.map((s, j) => (
                          <Draggable key={s.id} draggableId={`${index}-${s.id}`} index={j}>
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
                                  checked={s.selected}
                                  onCheckedChange={(c) =>
                                    updateSkill(index, j, { ...s, selected: !!c })
                                  }
                                />
                                <Input
                                  placeholder="Skill"
                                  value={s.name}
                                  onChange={(e) =>
                                    updateSkill(index, j, { ...s, name: e.target.value })
                                  }
                                  className="flex-grow"
                                />
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  onClick={() => deleteSkill(index, j)}
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
                  <Button onClick={() => addSkill(index)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Skill
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

export default SkillSection;
