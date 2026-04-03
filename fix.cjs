const fs = require('fs');

const content = fs.readFileSync('src/components/CreatorBook.tsx', 'utf8');
const startIdx = content.indexOf('const FeedPost_REMOVING_');
const endIdx = content.indexOf('function CommunityPost');

if (startIdx !== -1 && endIdx !== -1) {
    const newContent = content.substring(0, startIdx) + 
`const handleBooking = async (creator: any) => {
  // Mock booking logic
  toast.success(\`Booking request sent to \${creator.name}!\`);
};

` + content.substring(endIdx);
    fs.writeFileSync('src/components/CreatorBook.tsx', newContent);
    console.log("Fixed CreatorBook.tsx");
} else {
    console.log("Could not find markers: " + startIdx + " " + endIdx);
}
