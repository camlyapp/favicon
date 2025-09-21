import EditorPageContent from "./editor-client";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Favicon Editor",
    description: "Create and edit your favicon with a powerful set of tools. Add text, shapes, and colors to craft the perfect icon for your brand.",
};

export default function EditorPage() {

    return (
        <>
            <EditorPageContent />
        </>
    )
}

    