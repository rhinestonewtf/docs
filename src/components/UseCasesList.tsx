import useSWR from 'swr'
import Image from 'next/image'
import { Stats } from './Stats'
import { FC, useState } from 'react'
import { Link } from '@/components/Link'
import RedirectIcon from './icons/RedirectIcon'
import { UseCasesListItem } from '@/components/UseCasesListItem'
import { SoonUseCases } from '@/components/SoonUseCases'

type Stats = {
	lastWeekCount: number
	totalCount: number
	totalSignups: number
	lastWeekSignups: number
	success: true
}

// ANCHOR: LinkCard component for the links in the bottom of the page
const LinkCard: FC<{ href: string; heading: string; description: string }> = ({ href, heading, description }) => {
	return (
		<Link
			className="grid gap-y-2 content-start py-6 px-5 bg-gray-50 border border-gray-100 rounded-xl relative no-underline hover:bg-gray-100/70 transition-colors"
			href={href}
		>
			<span className="text-sm font-medium text-gray-900 !m-0 leading-none">{heading}</span>
			<p className="text-sm text-gray-900/80 m-0 leading-[1.3]">{description}</p>
			<RedirectIcon className="absolute top-4 right-4 h-5 w-5 text-gray-900" />
		</Link>
	)
}

// ANCHOR: Main page component
export const UseCasesList: FC<{}> = () => {
	const fetcher = (url: string) => fetch(url, { method: 'GET' }).then(response => response.json())

	const { data, isLoading } = useSWR<
		{
			lastWeekCount: number
			totalCount: number
			totalSignups: number
			lastWeekSignups: number
			success: true
		},
		{ error: string }
	>(`${process.env.NEXT_PUBLIC_APP_URL}/api/world-id-stats/fetch-verifications`, fetcher)

	return (
		<div>
			<div className="flex flex-col items-center">
				<div className="mt-12 font-medium text-sm text-[#007fd3] leading-4 uppercase">
          Registry Core Principles
				</div>
				<h1 className="m-0 mt-2 text-4xl text-center">
					The protocol to bring trust into modular Account Abstraction.
				</h1>
				<p className="m-0 mt-4 text-base text-gray-400 leading-6">
					Schemas. Attestions. Trust. 
				</p>
				<div className="mt-6 flex items-center gap-x-2">
					<Link
						className="px-4 py-3 bg-gray-900 text-white leading-4 no-underline rounded-[10px] hover:bg-gray-900/80"
						href="/quick-start"
					>
						Start Building
					</Link>
					<Link
						className="px-5 py-3 bg-gray-200 text-gray-900 leading-4 no-underline rounded-[10px] hover:bg-gray-200/80"
						href="/apps"
					>
						Explore Apps
					</Link>
				</div>
			</div>

			<h2 className="m-0 mt-16 font-bold text-sm text-gray-400 leading-4 uppercase">
        Core principles
			</h2>

			<div className="mt-2 grid grid-cols-1 gap-4 lg:grid-cols-2">
				<UseCasesListItem
					color="#4940E0"
					image="/images/docs/use-cases/icons/voting-platforms.svg"
					title="Attestations"
					description="Attestations are digitally documented assertions made by an entity (attestor) about the security of account abstraction modules, serving as a seal of authenticity for the associated data. Each attestation consists of two primary elements: the schema and the attestation data. The schema acts as a standardized structure for creating and validating attestations, while the attestation data represents the actual information subject to attestation."
					items={[
						'Assertions of security posture',
						'Permissionless attestations',
					]}
					linkHref="/use-cases/voting"
				/>

				<UseCasesListItem
					color="#487CA5"
					image="/images/docs/use-cases/icons/marketplaces.svg"
					title="Schema"
					description="Schemas are predefined structures utilized for the formation and verification of attestations. They establish a shared format and structure for attestation data, facilitating the creation and verification of various attestations in a trustless fashion."
					items={[
						'Predefined structures for attestation data',
						'Permissionless schema creation',
						'Extentibility through external Resolvers',
					]}
					linkHref="/use-cases/social-media"
				/>

				{/* TODO: uncomment after the use case is ready  */}
				{/*<UseCasesListItem*/}
				{/*	color="#9D50FF"*/}
				{/*	image="/images/docs/use-cases/icons/defi-and-fintech.svg"*/}
				{/*	title="DeFi and Fintech"*/}
				{/*	description="Bring seamless compliance, privacy-preserving AML, enhanced fraud prevention, decentralized credit scores and even negative reputation."*/}
				{/*	items={[*/}
				{/*		'Undercollateralized lending & credit',*/}
				{/*		'Credit card chargeback protection',*/}
				{/*		'Zero-knowledge compliance with nationality, age and sanctions',*/}
				{/*		'Private transaction mixer with daily amount limits and ZK compliance for AML',*/}
				{/*		'Private decentralized credit score',*/}
				{/*	]}*/}
				{/*	linkHref="/use-cases/defi-and-fintech"*/}
				{/*/>*/}

				<UseCasesListItem
					color="#00C313"
					image="/images/docs/use-cases/icons/events.svg"
					title="Attestors"
					description="
          Attestors are individuals or organizations responsible for creating and signing attestations. They add the attestation to the Ethereum blockchain, making it universally accessible for verification.
          "
					items={[
            'Permissionless',
            'Reputation',
            'Trusted Entities'
					]}
					linkHref="/use-cases/wealth-distribution"
				/>


				<UseCasesListItem
					color="#8080FF"
					image="/images/docs/use-cases/icons/wealth-distribution.svg"
					title="Modules"
					description="
          Modules are smart contracts that act as modular components that can be added to smart accounts. These modules and their deployment metadata are stored in the registry. The registry maintains cross-chain consistency, ensuring that users experience the same level of security and functionality, irrespective of the chain they're on.
          "
					items={[
						'Vendor Agnostic',
						'Ecosystem',
						'Trusted Security Posture',
					]}
					linkHref="/use-cases/wealth-distribution"
				/>


				<UseCasesListItem
					color="#B65FCF"
					image="/images/docs/use-cases/icons/social-media.svg"
					title="Users"
					description="
          Users represent entities that utilize the information enclosed within the attestations to inform decisions or initiate actions. They trust the attestations based on the reputation and trustworthiness of the attestor.
          "
					items={[
						'End Users',
						'Smart Accounts',
						'Vendor Agnostic',
					]}
					linkHref="/use-cases/wealth-distribution"
				/>

				{/*<UseCasesListItem*/}
				{/*	color="#FFB11B"*/}
				{/*	image="/images/docs/use-cases/icons/token-airdrops.svg"*/}
				{/*	title="Token Airdrops"*/}
				{/*	description="Airdrop tokens or other goods in a fair and transparent manner. Prevent spam or farming. Reward your real users."*/}
				{/*	items={[*/}
				{/*		'One person one share crypto airdrops',*/}
				{/*		'Crypto airdrops with quadratic rewards / caps per person',*/}
				{/*		'Quests and learn-to-earn distributions',*/}
				{/*	]}*/}
				{/*	linkHref="/use-cases/token-airdrops"*/}
				{/*/>*/}

				{/* TODO: uncomment after the use case is ready  */}
				{/*<UseCasesListItem*/}
				{/*	color="#FF5A76"*/}
				{/*	image="/images/docs/use-cases/icons/nfts.svg"*/}
				{/*	title="NFTs"*/}
				{/*	description="Bring soul-bound tokens to life by enabling NFTs that are actually associated with a person, and prevent NFT farming."*/}
				{/*	items={[*/}
				{/*		'One person one PFP avatar collection',*/}
				{/*		'Soulbound NFTs you can transfer between addresses of the same person',*/}
				{/*		'POAP integration',*/}
				{/*	]}*/}
				{/*	linkHref="/use-cases/nfts"*/}
				{/*/>*/}

				{/* TODO: uncomment after the use case is ready  */}
				{/*<UseCasesListItem*/}
				{/*	color="#C4554D"*/}
				{/*	image="/images/docs/use-cases/icons/customer-incentives.svg"*/}
				{/*	title="Customer Incentives"*/}
				{/*	description="Build customer loyalty and acquire new customers efficiently. Ensure beneficiaries are real people while preserving their privacy."*/}
				{/*	items={[*/}
				{/*		'Abuse resistant coupons and loyalty programs for retail businesses',*/}
				{/*		'One-time software free trials',*/}
				{/*		'Fraud-proof referral programs',*/}
				{/*		'Fee subsidies with per-person limits',*/}
				{/*	]}*/}
				{/*	linkHref="/use-cases/customer-incentives"*/}
				{/*/>*/}

				{/* TODO: uncomment after the use case is ready  */}
				{/*<UseCasesListItem*/}
				{/*	color="#39B8A8"*/}
				{/*	image="/images/docs/use-cases/icons/marketplaces.svg"*/}
				{/*	title="Marketplaces"*/}
				{/*	description="Enhance marketplaces with a new level of trust and transparency. Real reviews that others can trust."*/}
				{/*	items={[*/}
				{/*		'Fake review and transaction prevention',*/}
				{/*		'True merchant & customer ratings',*/}
				{/*		'One person one item purchase',*/}
				{/*	]}*/}
				{/*	linkHref="/use-cases/marketplaces"*/}
				{/*/>*/}

				{/* TODO: uncomment after the use case is ready  */}
				{/*<UseCasesListItem*/}
				{/*	color="#8A67AB"*/}
				{/*	image="/images/docs/use-cases/icons/events.svg"*/}
				{/*	title="Events"*/}
				{/*	description="We've all missed a ticket to our favorite event because they magically disappeared in 5 minutes. With World ID only people, not bots, not scalpers can buy tickets."*/}
				{/*	items={['Ticket scalper protection', 'Private age verification', 'Free bandwidth capped WiFi']}*/}
				{/*	linkHref="/use-cases/events"*/}
				{/*/>*/}
			</div>


			<h2 className="m-0 mt-16 font-bold text-xl text-black text-center">Join the Rhinestone builder community</h2>

			<Stats className="mt-6" />

			<div className="mt-6 text-2xs text-black/50 text-center">
			</div>

			<div className="grid gap-y-2 mt-24">
				<h3 className="uppercase text-2xs m-0 font-medium text-gray-500">More Resources</h3>

				<div className="grid lg:grid-cols-3 gap-2">
					<LinkCard
						href="/quick-start"
						heading="Start building"
						description="The Quick Start is the easiest place to start"
					/>

					<LinkCard
						href="https://worldcoin.org/grants"
						heading="Worldcoin Grants"
						description="Grants by the Worldcoin Foundation are coming soon."
					/>

					<LinkCard
						href="https://worldcoin.org/discord"
						heading="Join our Discord community"
						description="Jam on ideas, see what others are building, ask questions. Look for the #developers channel."
					/>
				</div>
			</div>
		</div>
	)
}
