"use client";

import React, { useState } from "react";
import {
  Container, Title, Text, Textarea, TextInput, NumberInput,
  Button, Group, Paper, Stack, Divider, Code, LoadingOverlay
} from "@mantine/core";

const toWeeks = (val: string | number): number | "" => {
  if (val === "") return "";
  if (typeof val === "number") return val;
  const n = Number(val);
  return Number.isNaN(n) ? "" : n;
};

export default function Page() {
  const [subject, setSubject] = useState("数学");
  const [grade, setGrade] = useState("高一");
  const [weeks, setWeeks] = useState<number | "">(8);
  const [goalsText, setGoalsText] = useState("理解一次函数斜率\n能从两点求直线方程");

  const [resp, setResp] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    setResp(null);
    try {
      const goals = goalsText.split(/\r?\n/).map((s: string) => s.trim()).filter(Boolean);
      const res = await fetch("http://127.0.0.1:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, grade, weeks: Number(weeks || 0), goals }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResp(data);
    } catch (e: any) {
      setError(e?.message || "请求失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="lg">
      <Title order={2} mb="xs">Lesson Plan MVP</Title>
      <Text c="dimmed" mb="md">输入课程要求 → 调用 FastAPI /generate → 展示返回的大纲与教案（假数据版）。</Text>

      <Paper withBorder p="md" radius="lg" style={{ position: "relative" }}>
        <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "lg", blur: 2 }} />
        <Stack>
          <Group grow>
            <TextInput
              label="学科 subject"
              value={subject}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.currentTarget.value)}
            />
            <TextInput
              label="年级 grade"
              value={grade}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGrade(e.currentTarget.value)}
            />
            <NumberInput
              label="周数 weeks"
              value={weeks}
              onChange={(val: string | number) => setWeeks(toWeeks(val))}
              min={1}
              clampBehavior="strict"
            />
          </Group>
          <Textarea
            label="学习目标 goals(一行一个)"
            minRows={4}
            value={goalsText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setGoalsText(e.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button onClick={handleGenerate}>生成教案 (MVP)</Button>
          </Group>
        </Stack>
      </Paper>

      <Divider my="lg" />

      {error && (
        <Paper withBorder p="md" radius="lg" bg="var(--mantine-color-red-light)">
          <Text fw={600}>请求失败</Text>
          <Text>{error}</Text>
        </Paper>
      )}

      {resp && (
        <Stack>
          <Paper withBorder p="md" radius="lg">
            <Title order={4}>文字摘要</Title>
            <Text>{resp?.plan?.text_summary || ""}</Text>
          </Paper>

          <Paper withBorder p="md" radius="lg">
            <Title order={4}>课程大纲 syllabus</Title>
            <Code block>{JSON.stringify(resp?.plan?.syllabus, null, 2)}</Code>
          </Paper>

          <Paper withBorder p="md" radius="lg">
            <Title order={4}>单课时教案 lesson_plan</Title>
            <Code block>{JSON.stringify(resp?.plan?.lesson_plan, null, 2)}</Code>
          </Paper>

          <Paper withBorder p="md" radius="lg">
            <Title order={4}>学生反馈 feedback</Title>
            <Code block>{JSON.stringify(resp?.feedback, null, 2)}</Code>
          </Paper>
        </Stack>
      )}
    </Container>
  );
}
