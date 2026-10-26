// src/composables/useAnnotations.js
import axios from 'axios';
import { ref } from 'vue';

const annotations = ref([]);

export function useAnnotations() {
    const getAnnotations = async () => {
        const response = await axios.get('/api/annotations');
        annotations.value = response.data;
        return annotations.value;
    };

    const saveAnnotation = async (text: any, comment: any) => {
        await axios.post('/api/annotations', { text, comment });
    };

    return { annotations, getAnnotations, saveAnnotation };
}
// https://www.rm.fm/breakz
/*

I often see people struggling with the difference between descriptive and inferential statistics, so here's a simple breakdown to help clarify!

Descriptive Statistics:

✅ Purpose: Summarizes data from a sample using measures such as mean, median, and mode.
✅ Usage: Excellent for presenting data trends and distributions clearly, without making predictions.
✅ Examples:

1️⃣ Calculating the average test score of students.
2️⃣ Graphing sales data over the year to observe trends.
3️⃣ Reporting the frequency of customer feedback categories.

Inferential Statistics:

✅ Purpose: Uses sample data to make predictions or inferences about a larger population.
✅ Usage: Essential for hypothesis testing and determining the probability that an observed pattern is genuine.
✅ Examples:

1️⃣ Estimating the average height of all adults in a city by examining a sample group.
2️⃣ Using survey results to predict election outcomes.
3️⃣ Assessing the effectiveness of a new drug based on clinical trial data.

The key takeaway: Descriptive statistics help you describe your current data, while inferential statistics allow you to make predictions and informed decisions based on your data.

*/