"use client";

import GithubIcon from "@/components/icons/github-icon";
import Spinner from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import imagePlaceholder from "@/public/image-placeholder.png";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import Image from "next/image";
import { useEffect, useState } from "react";

type ImageResponse = {
  b64_json: string;
  timings: { inference: number };
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [iterativeMode, setIterativeMode] = useState(false);
  const debouncedPrompt = useDebounce(prompt, 300);
  const [generations, setGenerations] = useState<
    { prompt: string; image: ImageResponse }[]
  >([]);
  let [activeIndex, setActiveIndex] = useState<number>();

  const { data: image, isFetching } = useQuery({
    placeholderData: (previousData) => previousData,
    queryKey: [debouncedPrompt],
    queryFn: async () => {
      let res = await fetch("/api/generateImages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, iterativeMode }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
      return (await res.json()) as ImageResponse;
    },
    enabled: !!debouncedPrompt.trim(),
    staleTime: Infinity,
    retry: false,
  });

  let isDebouncing = prompt !== debouncedPrompt;

  useEffect(() => {
    if (image && !generations.map((g) => g.image).includes(image)) {
      setGenerations((images) => [...images, { prompt, image }]);
      setActiveIndex(generations.length);
    }
  }, [generations, image, prompt]);

  let activeImage =
    activeIndex !== undefined ? generations[activeIndex].image : undefined;

    return (
      <div className="flex h-full flex-col px-5">
        <header className="flex justify-center pt-20 md:justify-end md:pt-3">
          <div className="absolute left-1/2 top-6 -translate-x-1/2">
          </div>
        </header>
  
        <div className="flex justify-center items-center grow flex-col">
          <div className="text-center mb-5" style={{ marginBottom: '20px' }}>
            <h1 className="text-4xl font-bold text-gray-200">AI-GENZ</h1>
            <p className="text-lg text-gray-300">Your AI Image Generation Tool</p>
          </div>
          <form className="w-full max-w-lg" style={{ marginTop: '100px' }}>
            <fieldset>
              <div className="relative">
                <Textarea
                  rows={4}
                  spellCheck={false}
                  placeholder="Describe your image..."
                  required
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full resize-none border-gray-300 border-opacity-50 bg-gray-400 px-4 text-base placeholder-gray-300"
                />
                <div
                  className={`${isFetching || isDebouncing ? "flex" : "hidden"} absolute bottom-3 right-3 items-center justify-center`}
                >
                  <Spinner className="size-4" />
                </div>
              </div>
  
              <div className="mt-3 text-sm md:text-right">
                <label
                  title="Use earlier images as references"
                  className="inline-flex items-center gap-2"
                >
                  Consistency mode
                  <Switch
                    checked={iterativeMode}
                    onCheckedChange={setIterativeMode}
                  />
                </label>
              </div>
            </fieldset>
          </form>
        </div>

      <div className="flex w-full grow flex-col items-center justify-center pb-8 pt-4 text-center">
        {!activeImage || !prompt ? (
          <div className="max-w-xl md:max-w-4xl lg:max-w-3xl">
            <p className="text-xl font-semibold text-gray-200 md:text-3xl lg:text-4xl">
              Generate images in real-time
            </p>
            <p className="mt-4 text-balance text-sm text-gray-300 md:text-base lg:text-lg">
              Enter a prompt and generate images in milliseconds as you type.
              
            </p>
          </div>
        ) : (
          <div className="mt-4 flex w-full max-w-4xl flex-col justify-center">
            <div>
              <Image
                placeholder="blur"
                blurDataURL={imagePlaceholder.blurDataURL}
                width={1024}
                height={768}
                src={`data:image/png;base64,${activeImage.b64_json}`}
                alt=""
                className={`${isFetching ? "animate-pulse" : ""} max-w-full rounded-lg object-cover shadow-sm shadow-black`}
              />
            </div>

            <div className="mt-4 flex gap-4 overflow-x-scroll pb-4">
              {generations.map((generatedImage, i) => (
                <button
                  key={i}
                  className="w-32 shrink-0 opacity-50 hover:opacity-100"
                  onClick={() => setActiveIndex(i)}
                >
                  <Image
                    placeholder="blur"
                    blurDataURL={imagePlaceholder.blurDataURL}
                    width={1024}
                    height={768}
                    src={`data:image/png;base64,${generatedImage.image.b64_json}`}
                    alt=""
                    className="max-w-full rounded-lg object-cover shadow-sm shadow-black"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="mt-16 w-full flex flex-col items-center pb-10 text-gray-300 md:mt-4 md:pb-5 md:text-xs lg:text-sm">
  <div className="mt-8 flex items-center justify-center gap-6 md:gap-2 w-full">
    <a href="https://github.com/Likith-Yadav" target="_blank">
      <Button
        variant="outline"
        size="sm"
        className="inline-flex items-center gap-2"
      >
        <GithubIcon className="size-4" />
        GitHub
      </Button>
    </a>
    <a href="https://www.linkedin.com/in/likithyadavgn/" target="_blank" rel="noopener noreferrer">
  <Button
    size="sm"
    variant="outline"
    className="inline-flex items-center gap-2"
  >
    <img 
      src="https://www.iconpacks.net/icons/1/free-linkedin-icon-112-thumb.png" 
      className="size-4 filter brightness-0 invert" 
      alt="LinkedIn" 
    />
    LinkedIn
  </Button>
</a>
    <a href="https://portfolio-likith-yadavs-projects.vercel.app/" target="_blank">
      <Button
        size="sm"
        variant="outline"
        className="inline-flex items-center gap-2"
      >
        Contact Me
      </Button>
    </a>
  </div>
  <p className="mt-4 text-center text-sm">Made by Likith Yadav</p>
</footer>
    </div>
  );
}
