export interface NarrativeNote {
  readonly id: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly date?: string;
  readonly body: readonly string[];
  readonly footer?: string;
}

export const NARRATIVE_NOTES: readonly NarrativeNote[] = [
  {
    id: 'reception-memo',
    eyebrow: 'NIGHT DESK · INTERNAL',
    title: 'Observation protocol 6B',
    date: '14 OCT 1998',
    body: [
      'If a subject reports footsteps outside the room, log the time. Do not enter the corridor until the subject confirms the sound has stopped.',
      'Do not ask what they believe is making the sound. Acknowledgement appears to reinforce the episode.',
      'Mirrors in Rooms 214–219 are to remain covered after 21:00.',
    ],
    footer:
      'Initial each completed round. If you hear your own name, end the round without looking back.',
  },
  {
    id: 'office-letter',
    eyebrow: 'UNSENT LETTER',
    title: 'Mara, I am sorry.',
    body: [
      'The patients are not copying one another. I moved Seventeen to the west room and never told him what Eight said. He used the same words anyway: “It waits in the part of the room I cannot see.”',
      'Last night the camera showed his chair beside the bed. When I opened the door it was against the opposite wall. The tape never shows it moving.',
      'I have started hearing the second set of steps on my rounds. They stop when I stop.',
    ],
    footer: 'The last line is pressed so hard the paper has torn.',
  },
  {
    id: 'washroom-scrap',
    eyebrow: 'TORN LABEL · RECOVERED FROM DRAIN',
    title: 'Tape 17-C — partial transcript',
    date: '03:17:42',
    body: [
      'DR VOSS: There is nobody behind you, Elias.',
      'SUBJECT 17: I know.',
      'DR VOSS: Then why are you facing the wall?',
      'SUBJECT 17: So it has somewhere to stand.',
      '[Twenty-three seconds of silence.]',
      'SUBJECT 17: Doctor… who is behind you?',
    ],
  },
  {
    id: 'records-17',
    eyebrow: 'RESTRICTED · CASE HLC-217',
    title: 'Observer-contingent displacement',
    date: 'FINAL REVIEW · 17 OCT 1998',
    body: [
      'Environmental changes occur only after the subject redirects attention toward a reported stimulus and then returns to the original field of view.',
      'The phenomenon does not require the subject to see an entity. Expectation appears sufficient.',
      'All overnight personnel now report secondary footsteps. Annex closure authorized. Security key moved to Room 217 pending morning evacuation.',
    ],
    footer: 'Handwritten beneath the signature: “Morning did not come.”',
  },
  {
    id: 'patient-wall',
    eyebrow: 'ROOM 217 · WRITING UNDER THE BED',
    title: 'Rules for being alone',
    body: [
      'One: A room is only empty while you can see all of it.',
      'Two: If the footsteps stop, yours should not.',
      'Three: It cannot follow you through a door unless you hold it open by remembering.',
      'Four: Do not count how many times you looked.',
    ],
    footer: 'There is a fifth number. Whatever followed it has been scratched through the plaster.',
  },
];

export const findNote = (id: string): NarrativeNote | null =>
  NARRATIVE_NOTES.find((note) => note.id === id) ?? null;
