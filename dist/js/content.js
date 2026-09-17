// Visible copy and media configuration. A null src is an intentional placeholder.
export const media={overview:{title:'GTPO · Method overview',poster:null,src:null},tasks:[
 {id:'stack-blocks',title:'Stack blocks',poster:'assets/photo-65.webp',src:null,description:'Stacking foam blocks with a UR5.'},
 {id:'insert-battery',title:'Insert battery',poster:'assets/photo-63.webp',src:null,description:'Aligning and inserting a battery.'},
 {id:'solder-component',title:'Solder component',poster:'assets/videos/solder-component-v1.jpg',src:'assets/videos/solder-component-v1.m4v',description:'Contact-rich component soldering.'},
 {id:'drive-screw',title:'Drive screw',poster:'assets/photo-64.webp',src:null,description:'Fine alignment for screw driving.'},
 {id:'pop-the-top',title:'Pop the top',poster:'assets/photo-68.webp',src:null,description:'Removing a bottle cap with a tool.'}]};
export const captions={
 1:'<strong>GTPO overview.</strong> <strong>(a)</strong> From the same initial environment state, the policy samples a group of successful and failed trajectories and stores them in the rollout buffer. <strong>(b)</strong> GRPO broadcasts each sparse trajectory-level advantage uniformly across all action chunks. <strong>(c)</strong> GTPO pairs each failure with its nearest successful rollout in visual feature space and uses temporal OT alignment to produce a dense advantage over time. <strong>(d)</strong> This dense credit assignment improves both average success rate and RL training efficiency under the same rollout budget and policy initialization.',
 2:'<strong>GTPO pipeline.</strong> <strong>(a)</strong> Rollouts are encoded as visual feature trajectories, and each failed rollout is paired with its nearest successful teacher. <strong>(b)</strong> A temporally masked Sinkhorn plan aligns the paired trajectories. <strong>(c)</strong> The alignment produces chunk-level credit weights that reshape the original GRPO advantage for policy optimization without altering the rollout collection procedure.',
 3:'Training efficiency on <strong>LIBERO-Object</strong> (top left), <strong>LIBERO-Spatial</strong> (top right), <strong>LIBERO-Goal</strong> (bottom left), and <strong>LIBERO-Long</strong> (bottom right). Pale points are recorded success rates; solid and patterned curves are seven-checkpoint moving averages. The 95% reference line marks time-to-success; “&gt;” indicates a threshold not reached within the recorded budget. † One-demonstration warm start; ‡ full-demonstration warm start.',
 4:'OT necessity ablation on <strong>LIBERO-Object</strong>. Curves show the recorded success rates for GRPO, GTPO-pointwise, and GTPO. Lines are seven-checkpoint moving averages; pale points are raw evaluations, not seed-level uncertainty.',
 5:'Design analyses on <strong>LIBERO-Object</strong>: <strong>(a)</strong> temporal window, <strong>(b)</strong> credit temperature, and <strong>(c)</strong> teacher assignment. The complete metric table is shown below.',
 6:'Illustration of OT credit allocation for a successful teacher (top) and failed student (bottom). The weight profile refers to the student; red marks the annotated failed grasp.',
 7:'Real-world setup and tasks: <strong>(a)</strong> scene; <strong>(b)</strong> stack blocks; <strong>(c)</strong> insert battery; <strong>(d)</strong> solder component; <strong>(e)</strong> drive screw; and <strong>(f)</strong> pop the top.',
 8:'Real-world success from <strong>20 trials per point</strong>. <strong>(a)</strong> SFT initialization and three on-policy training rounds for two representative tasks; solid/dashed lines denote GTPO/GRPO, and circle/square markers distinguish soldering/opening. <strong>(b)</strong> SFT initialization and final-iteration success on all five tasks.'};
export const tableNotes={
 1:'† One demo per task · ‡ Full demos · § Published settings. Gains are relative to matched SFT.',
 3:'TTS@95: > marks an unreached threshold; improvement is a lower bound. AUC-SR / Early SR: percentage points.',
 4:'Final SR: raw evaluation. Other metrics: 7-checkpoint moving mean.',
 5:'τ: 0.05 → 1. AUC / Early SR: %. TTS@95: steps; > means not reached.',
 8:'Appendix: k = 15, τ = 0.01 → 1; main-text ablation: k = 30, τ = 0.05 → 1.'};
