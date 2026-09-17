export const idea = {
  summary: 'Robot learning is expensive, and a final success or failure says little about which actions need improvement. GTPO lets successful rollouts teach similar failed ones, using temporal alignment to turn sparse feedback into guidance for individual action chunks.',
  note: 'Classroom analogy · Students represent rollouts; tutoring represents dense credit assignment. Scores are illustrative.',
  students: [{id:1, score:90, answers:[true,true,true]}, {id:2, score:80, answers:[true,true,true]}, {id:4, score:30, answers:[false,true,false]}, {id:3, score:40, answers:[true,false,false]}],
  phases: [
    {id:'intro', method:'setup', duration:2000, caption:'Same class. Different outcomes.', detail:'Four students work through the same exercise.', boardMethod:'Same exercise', board:'Four attempts. One class average.', boardSub:'(90 + 80 + 40 + 30) / 4 = 60'},
    {id:'grpo', method:'grpo', duration:3000, caption:'One verdict for the whole attempt', detail:'Above or below the average: the same feedback is shared by every step.', boardMethod:'GRPO', board:'One verdict for all steps', boardSub:'Above 60: positive · Below 60: negative'},
    {id:'gtpo', method:'gtpo', duration:4000, caption:'Learn from a similar successful peer', detail:'Match similar solution paths: student 2 helps 3; student 1 helps 4.', boardMethod:'GTPO', board:'Pair up. Align the steps.', boardSub:'Student 2 → 3 · Student 1 → 4'},
    {id:'improve', method:'gtpo', duration:3000, caption:'Targeted guidance. Faster progress.', detail:'Align the steps, then focus guidance where the attempts diverge.', boardMethod:'GTPO', board:'Specific guidance for each step', boardSub:'Learn together. Improve together.'}
  ]
};
